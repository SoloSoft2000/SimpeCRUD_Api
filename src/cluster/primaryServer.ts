import http from 'http';
import cluster from 'cluster';
import { resId } from '../utils/generateId';

let currentWorkerIdx = 0;

export const primaryServer = (responses, numCPUs): http.Server => {
  return http.createServer((req, res) => {
    const currRes = resId();
    responses[currRes] = res;
    const workIds = Object.keys(cluster.workers);
    const selectedWorker = cluster.workers[workIds[currentWorkerIdx]];
    currentWorkerIdx++;
    if (currentWorkerIdx === numCPUs) {
      currentWorkerIdx = 0;
    }
    if ((req.method === 'GET' || req.method === 'DELETE') && req.url.startsWith('/api/users')) {
      const request = { url: req.url, method: req.method };
      selectedWorker.send({ command: 'forward', request, responseId: currRes });
    } else if ((req.method === 'POST' || req.method === 'PUT') && req.url.startsWith('/api/users')) {
      let requestBody = '';
      req.on('data', (chunk) => {
        requestBody += chunk;
      });
      req.on('end', () => {
        const request = { url: req.url, method: req.method, body: requestBody };
        selectedWorker.send({ command: 'forward', request, responseId: currRes });
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: "Endpoint doesn't exist" }));
    }
  });
};
