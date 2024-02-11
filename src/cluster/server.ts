import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import process from 'process';
import { Database } from '../utils/Database';
import { Route } from '../utils/Route';
import { getRoutes } from '../utils/routes';
import { getServer } from '../utils/server';

const numCPUs = availableParallelism();
const PORT = process.env.PORT || 4000;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  cluster.schedulingPolicy = cluster.SCHED_RR;
  for (let idx = 0; idx < numCPUs; idx++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const db = new Database();
  const routes: Route[] = getRoutes(db);
  const server: http.Server = getServer(routes);
  const newPort = Number(PORT) + cluster.worker.id;
  server.listen(4000, (): void => {
    console.log(`Server listen on Port ${newPort}`);
  });
}
