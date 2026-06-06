import bcrypt from 'bcryptjs';

export const hashPassword = (password: string) => bcrypt.hash(password, 10);
export const comparePassword = (input: string, hash: string) =>
  bcrypt.compare(input, hash);
