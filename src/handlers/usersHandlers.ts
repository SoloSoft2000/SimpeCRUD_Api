import http from 'http';
import { Database } from '../utils/Database';

export const usersHandlers = (response: http.ServerResponse, db: Database): void => {
  try {
    const users = db.getUsers();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
  } catch {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end('Error in DB');
  }
};
