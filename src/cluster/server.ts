import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import process from 'process';
import { fork } from 'child_process';

const numCPUs = availableParallelism();
const PORT = process.env.PORT || 4000;
let currentWorkerIdx = 0;

const resId = (): string => Math.random().toString(36).substring(7);

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  const responses = {};

  const masterServer = http.createServer((req, res) => {
    const currRes = resId();
    responses[currRes] = res;
    const workIds = Object.keys(cluster.workers);
    const selectedWorker = cluster.workers[workIds[currentWorkerIdx]];
    currentWorkerIdx++;
    if (currentWorkerIdx === numCPUs) {
      currentWorkerIdx = 0;
    }
    if (req.method === 'GET') {
      const request = { url: req.url, method: req.method };
      selectedWorker.send({ command: 'forward', request, responseId: currRes });
    } else {
      let requestBody = '';
      req.on('data', (chunk) => {
        requestBody += chunk;
      });
      req.on('end', () => {
        const request = { url: req.url, method: req.method, body: requestBody };
        selectedWorker.send({ command: 'forward', request, responseId: currRes });
      });
    }
  });

  masterServer.listen(Number(PORT), () => {
    console.log(`Master ${process.pid} listening on port ${Number(PORT)}`);
  });

  const databaseProcess = fork('./dist/cluster/databaseProcess.js');

  databaseProcess.on('message', (msg: { workerId: string; result; responseId: string }) => {
    cluster.workers[msg.workerId].send({ command: 'responseDB', result: msg.result, responseId: msg.responseId });
  });

  for (const id in cluster.workers) {
    cluster.workers[id].on(
      'message',
      (msg: { reqToBD?: boolean; action?: string; responseId: string; userData?: string; data }) => {
        if (msg.reqToBD) {
          databaseProcess.send({
            action: msg.action,
            workerId: id,
            responseId: msg.responseId,
            userData: msg.userData,
          });
          return;
        }
        const res: http.ServerResponse = responses[msg.responseId];
        res.end(msg.data);
      },
    );
  }
} else {
  const responses = {};

  const server = http.createServer((req, res) => {
    const currRes = resId();
    responses[currRes] = res;
    if (req.method === 'GET') {
      process.send({ reqToBD: true, action: 'getUsers', responseId: currRes });
    }
    if (req.method === 'POST') {
      let requestBody = '';
      req.on('data', (chunk) => {
        requestBody += chunk;
      });
      req.on('end', () => {
        process.send({ reqToBD: true, action: 'createUser', responseId: currRes, userData: requestBody });
      });
    }
    console.log(`worker ${process.pid} received request`);
  });

  server.listen(Number(PORT) + cluster.worker.id, () => {
    console.log(`Worker ${process.pid} listening on port ${Number(PORT) + cluster.worker.id}`);
  });

  process.on('message', (msg: { command?: string; responseId?: string; result?; request? }) => {
    if (msg.command === 'responseDB') {
      const res: http.ServerResponse = responses[msg.responseId];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(msg.result));
      return;
    }
    if (msg.command === 'forward') {
      const requestOptions = {
        host: 'localhost',
        port: Number(PORT) + cluster.worker.id,
        path: msg.request.url,
        method: msg.request.method,
      };

      const req = http.request(requestOptions, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          process.send({ data, responseId: msg.responseId });
        });
      });

      req.on('error', (error) => {
        console.error('Error occurred while processing request:', error);
      });

      if (msg.request.body) {
        req.write(msg.request.body);
      }

      req.end();
    }
  });
}
