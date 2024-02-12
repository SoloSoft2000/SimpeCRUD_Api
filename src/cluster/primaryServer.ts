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
};
