import http from 'http';
import { Database } from '../src/utils/Database';
import { getServer } from '../src/utils/server';
import { getRoutes } from '../src/utils/routes';

// Здесь предполагается, что у вас уже есть сервер, который вы создаете в своем приложении.
const db = new Database();
const routes = getRoutes(db);
const server = getServer(routes);

const PORT = 4000; // Используем тестовый порт для избежания конфликтов

// Тест для получения всех записей
test('GET /api/users - Get all records', done => {
  http.get(`http://localhost:${PORT}/api/users`, res => {
    expect(res.statusCode).toBe(200);
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      const result = JSON.parse(data);
      expect(Array.isArray(result)).toBe(true); // Проверяем, что результат - это массив
      done();
    });
  });
});

// Тест для создания новой записи
test('POST /api/users - Create new record', done => {
  const requestData = JSON.stringify({ /* Данные для создания записи */ });
  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': requestData.length
    }
  };

  const req = http.request(options, res => {
    expect(res.statusCode).toBe(200);
    let data = '';
    res.on('data', chunk => {
      data += chunk;
    });
    res.on('end', () => {
      const result = JSON.parse(data);
      // Дополнительные проверки данных ответа
      console.log(result);
      
      done();
    });
  });

  req.write(requestData);
  req.end();
});

// Остальные тесты для других эндпоинтов могут быть реализованы аналогичным образом

// Закрытие сервера после завершения всех тестов
afterAll(() => {
  server.close();
});
