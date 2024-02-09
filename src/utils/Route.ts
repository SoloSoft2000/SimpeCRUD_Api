import http from 'http';

export class Route {
  private path: string;
  private method: string;
  private handler: (request: http.IncomingMessage, response: http.ServerResponse, params?: string) => void;

  constructor(
    path: string,
    method: string,
    handler: (request: http.IncomingMessage, response: http.ServerResponse, params?: string) => void,
  ) {
    this.path = path;
    this.method = method;
    this.handler = handler;
  }

  match(request: http.IncomingMessage): boolean {
    if (this.path.includes(':id')) {
      const reqUrl = request.url.split('/').slice(0, -1).join('/');
      const routeUrl = this.path.split('/').slice(0, -1).join('/');
      return request.method === this.method && reqUrl === routeUrl;
    } else {
      return request.method === this.method && request.url === this.path;
    }
  }

  handle(request: http.IncomingMessage, response: http.ServerResponse): void {
    const queryParams = request.url.split('/').pop() || '';

    this.handler(request, response, queryParams);
  }
}
