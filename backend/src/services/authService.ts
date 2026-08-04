import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, type IUser } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

const sign = (user: IUser): string =>
  jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user._id.toString(),
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
export const register = async (input: {
  fullName: string;
  email: string;
  password: string;
  role: IUser['role'];
  phone?: string;
}) => {
  if (await User.exists({ email: input.email.toLowerCase() }))
    throw new AppError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
  const user = await User.create({
    ...input,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 12),
  });
  return { user, token: sign(user) };
};
export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  return { user, token: sign(user) };
};
