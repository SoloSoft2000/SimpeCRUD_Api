import { v4 as uuidv4, validate } from 'uuid';

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
    if (!validate(userId)) {
      throw new Error('Invalid userId');
    }
    return this.users.find((user) => user.id === userId);
  }

  createUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  deleteById(userId: string): boolean {
    if (!validate(userId)) {
      throw new Error('Invalid userId');
    }
    const idx = this.users.findIndex((user) => user.id === userId);
    if (idx === -1) {
      return false;
    } else {
      this.users.splice(idx, 1);
      return true;
    }
  }
}
