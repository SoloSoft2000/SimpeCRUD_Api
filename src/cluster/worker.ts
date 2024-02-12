import http from 'http';
import cluster from 'cluster';
import { workerServer } from './workerServer';
import 'dotenv/config';

const PORT = process.env.PORT || 4000;

export const worker = (): void => {
  const responses = {};

  const server = workerServer(responses);

  server.listen(Number(PORT) + cluster.worker.id, () => {
    console.log(`Worker ${process.pid} listening on port ${Number(PORT) + cluster.worker.id}`);
  });

  process.on('message', (msg: { command?: string; responseId?: string; result?; request? }) => {
    if (msg.command === 'responseDB') {
      const res: http.ServerResponse = responses[msg.responseId];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(msg.result));
      return;
    }
    if (msg.command === 'forward') {
      const requestOptions = {
        host: 'localhost',
        port: Number(PORT) + cluster.worker.id,
        path: msg.request.url,
        method: msg.request.method,
      };

      const req = http.request(requestOptions, (response) => {
        let data = '';
        response.on('data', (chunk) => {
          data += chunk;
        });
        response.on('end', () => {
          process.send({ data, responseId: msg.responseId });
        });
      });

      req.on('error', (error) => {
        console.error('Error occurred while processing request:', error);
      });

      if (msg.request.body) {
        req.write(msg.request.body);
      }

      req.end();
    }
  });
};
