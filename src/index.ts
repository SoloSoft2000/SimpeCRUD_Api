import 'dotenv/config';
import http from 'http';
import { Database } from './utils/Database';
import { Route } from './utils/Route';
import { getRoutes } from './utils/routes';
import { getServer } from './utils/server';

const PORT = process.env.PORT || 4000;
const db = new Database();

const routes: Route[] = getRoutes(db);

const server: http.Server = getServer(routes);

server.listen(PORT);
