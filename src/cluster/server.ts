import 'dotenv/config';
import http from 'http';
import cluster from 'cluster';
import { availableParallelism } from 'os';
import process from 'process';
import { fork } from 'child_process';
import { primaryServer } from './primaryServer';
import { worker } from './worker';

const numCPUs = availableParallelism() - 1;
const PORT = process.env.PORT || 4000;

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  const responses = {};
  const masterServer = primaryServer(responses, numCPUs);

  masterServer.listen(Number(PORT), () => {
    console.log(`Master ${process.pid} listening on port ${Number(PORT)}`);
  });

  const databaseProcess = fork('./dist/cluster/databaseProcess.js');

  databaseProcess.on('message', (msg: { workerId: string; result; responseId: string }) => {
    cluster.workers[msg.workerId].send({ command: 'responseDB', result: msg.result, responseId: msg.responseId });
  });

  for (const id in cluster.workers) {
    cluster.workers[id].on(
      'message',
      (msg: { reqToBD?: boolean; action?: string; responseId: string; userData?: string; data }) => {
        if (msg.reqToBD) {
          databaseProcess.send({
            action: msg.action,
            workerId: id,
            responseId: msg.responseId,
            userData: msg.userData,
          });
          return;
        }
        const res: http.ServerResponse = responses[msg.responseId];
        res.end(msg.data);
      },
    );
  }
} else {
  worker();
}
