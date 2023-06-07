import { getModelForClass, pre, prop, DocumentType, modelOptions, Severity, index } from '@typegoose/typegoose';
import argon from 'argon2';
import { nanoid } from 'nanoid';
import log from '../utils/logger';

export const privateFields = ['password', '__v', 'verificationCode', 'passwordResetCode', 'verified'];

@pre<User>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const hash = await argon.hash(this.password);
  this.password = hash;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ lowercase: true, unique: true, required: true })
  email: string;

  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  password: string;

  @prop({ required: true, default: () => nanoid() })
  verificationCode: string;

  @prop()
  passwordResetCode: string | null;

  @prop({ default: false })
  verified: boolean;

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await argon.verify(this.password, candidatePassword);
    } catch (error) {
      log.error(error, 'Password could not be verified');
      return false;
    }
  }
}

export const UserModel = getModelForClass(User);
