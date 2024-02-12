import http from 'http';
import { resId } from '../utils/generateId';
import { extractId } from '../utils/extractId';

export const workerServer = (responses): http.Server => {
  return http.createServer((req, res) => {
    try {
      const { userId, isCorrect } = extractId(req.url);
      if (!isCorrect) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "is invalid (not uuid)" }));
        return;
      }
      const currRes = resId();
      responses[currRes] = res;
      if (req.method === 'GET' && req.url === '/api/users') {
        process.send({ reqToBD: true, action: 'getUsers', responseId: currRes });
      } else if (req.method === 'GET' && req.url.startsWith('/api/users/')) {
        process.send({ reqToBD: true, action: 'getUserById', userId, responseId: currRes})
      } else if (req.method === 'POST' && req.url === '/api/users') {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk;
        });
        req.on('end', () => {
          const data = JSON.parse(requestBody);
          if (!data.username || (!data.age || typeof(data.age) !== 'number') || (!data.hobbies || !Array.isArray(data.hobbies))) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "user json not valid" }));
            return;
          }
          process.send({ reqToBD: true, action: 'createUser', responseId: currRes, userData: requestBody });
        });
      } else if (req.method === 'PUT' && req.url.startsWith('/api/users/')) {
        let requestBody = '';
        req.on('data', (chunk) => {
          requestBody += chunk;
        });
        req.on('end', () => {
          const data = JSON.parse(requestBody);
          if (!data.username || (!data.age || typeof(data.age) !== 'number') || (!data.hobbies || !Array.isArray(data.hobbies))) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "user json not valid" }));
            return;
          }
          process.send({ reqToBD: true, action: 'createUser', userId, responseId: currRes, userData: requestBody });
        });
      } else if (req.method === 'DELETE' && req.url.startsWith('/api/users/')) {
        process.send({ reqToBD: true, action: 'deleteById', userId, responseId: currRes})
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
