import crypto from 'crypto';

export const generateResetToken = (length = 6): string => {
  const digits = '0123456789';
  const bytes = crypto.randomBytes(length);
  let token = '';
  for (let i = 0; i < length; i++) {
    token += digits[bytes[i] % digits.length];
  }
  return token;
};
