import http from 'http';
import { Database } from '../utils/Database';

export const userByIdHandlers = (response: http.ServerResponse, params: string, db: Database): void => {
  try {
    const user = db.getUserById(params);
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "User doesn't exist" }));
    }
  } catch {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Id is invalid' }));
  }
};
