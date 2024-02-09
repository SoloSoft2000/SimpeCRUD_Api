import http from 'http';
import { Database } from '../utils/Database';

export const deleteUser = (response: http.ServerResponse, params: string, db: Database): void => {
  try {
    const isDeleted = db.deleteById(params);
    if (isDeleted) {
      response.writeHead(204, { 'Content-Type': 'application/json' });
      response.end();
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "User doesn't exist" }));
    }
  } catch {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Id is invalid' }));
  }
};
