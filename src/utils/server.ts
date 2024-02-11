import http from "http";
import { Route } from "./Route";

export const getServer = (routes: Route[]): http.Server => {
  return http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
    try {
      const matchingRoute: Route | undefined = routes.find((route) => route.match(request));
      if (matchingRoute) {
        matchingRoute.handle(request, response);
      } else {
        // Next line for test 'Internal Server Error'
        // if (Math.random() > 0.5) throw new Error('Generated Error');
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: "Endpoint doesn't exist" }));
      }
    } catch {
      response.writeHead(500, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
  });
}