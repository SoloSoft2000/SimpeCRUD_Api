import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import process from 'process';
import { Database, User } from '../utils/Database';
// import { Route } from '../utils/Route';
// import { getRoutes } from '../utils/routes';
// import { getServer } from '../utils/server';

const numCPUs = availableParallelism();
const PORT = process.env.PORT || 4000;

let currentWorkerIdx = 0;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  const db = new Database();

  cluster.schedulingPolicy = cluster.SCHED_RR;
  for (let idx = 0; idx < numCPUs; idx++) {
    const worker = cluster.fork();

    worker.on('message', (msg) => {
      console.log(`Master received message from worker: ${worker.id}`);
      if (msg.command === 'getUsers') {
        worker.send({ users: db.getUsers(), requestId: msg.requestId })
      }
      if (msg.command === 'createUser') {
        worker.send({ user: db.createUser(msg.userData), requestId: msg.requestId })
      }
    })
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  const masterServer = http.createServer(() => {
    const workerIds = Object.keys(cluster.workers);
    console.log('ids',  workerIds);
    const selectedWorker = cluster.workers[workerIds[currentWorkerIdx]];
    currentWorkerIdx++;
    if (currentWorkerIdx === numCPUs) {
      currentWorkerIdx = 0;
    }
    
    selectedWorker.send({ command: 'forwardReq' })
  })
    masterServer.listen(Number(PORT), () => {
      console.log(`Master ${process.pid} listening on port ${Number(PORT)}`);
    });
} else {
  console.log(`Worker ${process.pid} started`);

  const requests = {};
  const reqId = (): string => Math.random().toString(36).substring(7);

  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/api/users') {
      const currentRequest = reqId();
      requests[currentRequest] = res;
      process.send({ command: 'getUsers', requestId: currentRequest });
    }
    if (req.method === 'POST' && req.url === '/api/users') {
      const currentRequest = reqId();
      requests[currentRequest] = res;
      process.send({ command: 'createUser', userData: { 'username' : 'eugene', 'age': '47', 'hobbies': []}, requestId: currentRequest})
    }
  })
  
  server.listen(Number(PORT) + cluster.worker.id, () => {
    console.log(`Worker ${process.pid} listening on port ${Number(PORT) + cluster.worker.id}`);
  })

  process.on('message', (msg: {command?: string, req?: http.IncomingMessage, res?: http.ServerResponse, users? : User[], user?: User, requestId: string}) => {
    if (msg.command) {
      console.log(msg.req, msg.res);
    } else {
      const response = requests[msg.requestId];
      if (msg.users) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(msg.users));
        return;
      }
      if (msg.user) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(msg.user));
        return;
      }
    }
  })
}
