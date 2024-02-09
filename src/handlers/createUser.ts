import http from 'http';
import { Database } from '../utils/Database';

export const createUser = (request: http.IncomingMessage, response: http.ServerResponse, db: Database): void => {
  let requestBody = '';
  request.on('data', (chunk) => {
    requestBody += chunk;
  });
  request.on('end', () => {
    try {
      const { username, age, hobbies } = JSON.parse(requestBody);
      if (!username || !age || !hobbies) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'Username, age, and hobbies are required' }));
      } else {
        const newUser = db.createUser({ username, age, hobbies });
        response.writeHead(201, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(newUser));
      }
    } catch (error) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Username, age, and hobbies are required' }));
    }
  });
};
