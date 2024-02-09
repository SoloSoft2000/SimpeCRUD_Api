import http from 'http';
import { Database } from './utils/Database';
import { Route } from './utils/Route';

const PORT = process.env.PORT || 4000;
const db = new Database();

const routes: Route[] = [
  new Route('/', 'GET', (request: http.IncomingMessage, response: http.ServerResponse) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('Hello World');
  }),
  new Route('/api/users', 'GET', (request: http.IncomingMessage, response: http.ServerResponse) => {
    const users = db.getUsers();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(users));
  }),
  new Route('/api/users/:id', 'GET', (request: http.IncomingMessage, response: http.ServerResponse, params: string) => {
    try {
      const user = db.getUserById(params);
      if (user) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify(user));
      }
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: "User doesn't exist" }));
    } catch (error) {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Id is invalid' }));
    }
  }),
];

const server: http.Server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
  const matchingRoute: Route | undefined = routes.find((route) => route.match(request));
  if (matchingRoute) {
    matchingRoute.handle(request, response);
  } else {
    response.statusCode = 404;
    response.end('Not found');
  }
});

server.listen(PORT);
