import { User, UserModel } from '../models/user.models';

export function createUser(input: Partial<User>) {
  return UserModel.create(input);
}

export function findUserById(id: string) {
  return UserModel.findById(id);
}

export function findByEmail(email: string) {
  return UserModel.findOne({ email });
}
