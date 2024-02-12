import http from 'http';
import { resId } from '../utils/generateId';

export const workerServer = (responses): http.Server => {
  return http.createServer((req, res) => {
    try {
      const currRes = resId();
      responses[currRes] = res;
      if (req.method === 'GET' && req.url === '/api/users') {
        process.send({ reqToBD: true, action: 'getUsers', responseId: currRes });
      } else if (req.method === 'POST' && req.url === '/api/users') {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk;
        });
        req.on('end', () => {
          process.send({ reqToBD: true, action: 'createUser', responseId: currRes, userData: requestBody });
        });
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Endpoint doesn't exist" }));
      }
      console.log(`worker ${process.pid} received request`);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  });
};
