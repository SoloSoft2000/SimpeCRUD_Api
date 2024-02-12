import { Database, User } from '../utils/Database';

const database = new Database();

interface databaseMessage {
  action?: string;
  responseId?: string;
  workerId?: string;
  result?: User;
  userId?: string;
  userData?: string;
}

process.on('message', (msg: databaseMessage) => {
  try {
    if (msg.action === 'getUsers') {
      const users = database.getUsers();
      process.send({ action: 'getUsers', result: users, responseId: msg.responseId, workerId: msg.workerId });
    } else if (msg.action === 'getUserById') {
      const user = database.getUserById(msg.userId);
      process.send({ action: 'getUserById', result: user, responseId: msg.responseId, workerId: msg.workerId });
    } else if (msg.action === 'createUser') {
      const newUser = database.createUser(JSON.parse(msg.userData));
      process.send({ action: 'createUser', result: newUser, responseId: msg.responseId, workerId: msg.workerId });
    } else if (msg.action === 'deleteById') {
      const success = database.deleteById(msg.userId);
      process.send({ action: 'deleteById', result: success, responseId: msg.responseId, workerId: msg.workerId });
    } else if (msg.action === 'updateById') {
      const updatedUser = database.updateById(msg.userId, JSON.parse(msg.userData));
      process.send({ action: 'updateById', result: updatedUser, responseId: msg.responseId, workerId: msg.workerId });
    }
  } catch (error) {
    process.send({ action: 'error', result: error.message, responseId: msg.responseId, workerId: msg.workerId });
  }
  
});
