import { validate } from 'uuid';

export const extractId = (url): { userId?: string; isCorrect: boolean } => {
  if (url.startsWith('/api/users/')) {
    const userId = url.slice(11);
    if (validate(userId)) {
      return { userId, isCorrect: true };
    } else {
      return { isCorrect: false };
    }
  };

  return { isCorrect: true };
};
