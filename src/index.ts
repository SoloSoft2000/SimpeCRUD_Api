import http from 'http';
http
  .createServer(function (_, response) {
    response.end('Hello Node.JS!');
  })
  .listen(3000, '127.0.0.1', function () {
    console.log(' Server listen port 3000');
  });
