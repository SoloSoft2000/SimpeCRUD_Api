import http from 'http';
import { Database, User } from '../utils/Database';

export const updateUser = (
  request: http.IncomingMessage,
  response: http.ServerResponse,
  params: string,
  db: Database,
): void => {
  let requestBody = '';
  request.on('data', (chunk) => {
    requestBody += chunk;
  });
  request.on('end', () => {
    try {
      const { username, age, hobbies } = JSON.parse(requestBody);
      const updatedFields: Partial<User> = {};
      if (username && age && typeof(age) === 'number' && hobbies && Array.isArray(hobbies)) {
        updatedFields.username = username;
        updatedFields.age = age;
        updatedFields.hobbies = hobbies;
      }

      if (Object.keys(updatedFields).length) {
        const updatedUser = db.updateById(params, updatedFields);

        if (updatedUser) {
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify(updatedUser));
        } else {
          response.writeHead(404, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ message: "User doesn't exist" }));
        }
      } else {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: 'No fields to update' }));
      }
    } catch {
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Id is invalid' }));
    }
  });
};
