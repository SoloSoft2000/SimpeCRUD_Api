import 'dotenv/config';
import http from 'http';
import { Database } from './utils/Database';
import { Route } from './utils/Route';
import { usersHandlers } from './handlers/usersHandlers';
import { createUser } from './handlers/createUser';
import { userByIdHandlers } from './handlers/userById';
import { deleteUser } from './handlers/deleteUser';
import { updateUser } from './handlers/updateUser';

const PORT = process.env.PORT || 4000;
const db = new Database();

const routes: Route[] = [

  new Route('/api/users', 'GET', (_, response: http.ServerResponse) => usersHandlers(response, db)),

  new Route('/api/users', 'POST', (request: http.IncomingMessage, response: http.ServerResponse) =>
    createUser(request, response, db),
  ),

  new Route('/api/users/:id', 'PUT', (request: http.IncomingMessage, response: http.ServerResponse, params: string) =>
    updateUser(request, response, params, db),
  ),

  new Route('/api/users/:id', 'GET', (_, response: http.ServerResponse, params: string) =>
    userByIdHandlers(response, params, db),
  ),

  new Route('/api/users/:id', 'DELETE', (_, response: http.ServerResponse, params: string) =>
    deleteUser(response, params, db),
  ),
];

const server: http.Server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
  try {
    const matchingRoute: Route | undefined = routes.find((route) => route.match(request));
    if (matchingRoute) {
      matchingRoute.handle(request, response);
    } else {
      // Next line for test 'Internal Server Error'
      // if (Math.random() > 0.5) throw new Error('Generated Error');
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Endpoint doesn\'t exist' }));
    }
  } catch {
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Internal Server Error' }));
  }
});

server.listen(PORT);
