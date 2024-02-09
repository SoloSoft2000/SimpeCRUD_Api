import http from 'http';
import { Database } from './utils/Database';
import { Route } from './utils/Route';
import { usersHandlers } from './handlers/usersHandlers';
import { userByIdHandlers } from './handlers/userbyId';

const PORT = process.env.PORT || 4000;
const db = new Database();

const routes: Route[] = [
  new Route('/', 'GET', (_, response: http.ServerResponse) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end('Hello World');
  }),

  new Route('/api/users', 'GET', (_, response: http.ServerResponse) => usersHandlers(response, db)),

  new Route('/api/users/:id', 'GET', (_, response: http.ServerResponse, params: string) =>
    userByIdHandlers(response, params, db),
  ),
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
