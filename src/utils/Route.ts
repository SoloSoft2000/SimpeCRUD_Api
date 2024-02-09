import http from 'http';

export class Route {
  private path: string;
  private method: string;
  private handler: (request: http.IncomingMessage, response: http.ServerResponse) => void;

  constructor(path: string, method: string, handler: (request: http.IncomingMessage, response: http.ServerResponse) => void) {
    this.path = path;
    this.method = method;
    this.handler = handler;
  }

  match(request: http.IncomingMessage): boolean {
    return request.method === this.method && request.url === this.path;
  }

  handle(request: http.IncomingMessage, response: http.ServerResponse): void {
    this.handler(request, response);
  }
}