import http from 'http';
import { resId } from '../utils/generateId';

export const workerServer = (responses): http.Server => {
  return http.createServer((req, res) => {
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
};
