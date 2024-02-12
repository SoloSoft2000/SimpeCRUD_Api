import { Route } from './Route';
import http from 'http';
import { usersHandlers } from '../handlers/usersHandlers';
import { createUser } from '../handlers/createUser';
import { userByIdHandlers } from '../handlers/userById';
import { deleteUser } from '../handlers/deleteUser';
import { updateUser } from '../handlers/updateUser';
import { Database } from './Database';

export const getRoutes = (db: Database): Route[] => {
  return [
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
};
