import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
}

export class Database {
  private users: User[];

  constructor() {
    this.users = [];
  }

  getUsers(): User[] {
    return this.users;
  }

  getUserById(userId: string): User | undefined {
    return this.users.find(user => user.id === userId);
  };

  createUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  };
}
