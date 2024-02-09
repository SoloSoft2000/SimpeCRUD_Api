import http from 'http';
import { parse } from 'url';
import { Database } from './utils/Database';
import { Route } from './utils/Route';

const PORT = process.env.PORT || 4000;
const db = new Database();

const routes: Route[] = [
  new Route('/api/users', 'GET', (request: http.IncomingMessage, response: http.ServerResponse) => {
    const users = db.getUsers();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
  }),
  new Route('/api/users', 'GET', (request: http.IncomingMessage, response: http.ServerResponse) => {
    const users = db.getUsers();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
  }),
]

const server: http.Server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
  const matchingRoute: Route | undefined = routes.find(route => route.match(req));
  if (matchingRoute) {
    matchingRoute.handle(req, res);
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

server.listen(PORT);