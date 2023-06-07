import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput, VerifyUserInput } from '../schema/user.schema';
import { createUser, findByEmail, findUserById } from '../service/user.service';
import sendEmail from '../utils/mailer';
import log from '../utils/logger';

export const createUserHnadler = async (req: Request<{}, {}, CreateUserInput>, res: Response) => {
  const { body } = req;

  try {
    const user = await createUser(body);

    await sendEmail({
      from: 'test@example.com',
      to: user.email,
      subject: 'Please verify your account',
      text: `Verification code: ${user.verificationCode}, user: ${user._id}`,
    });

    return res.send('User created successfully!');
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).send('Account already exists');
    }
    return res.status(500).send(error);
  }
};

export const verifyUserHandler = async (req: Request<VerifyUserInput>, res: Response) => {
  const { id, verificationCode } = req.params;

  const user = await findUserById(id);

  if (!user) {
    return res.send('Could not verify user');
  }

  if (user.verified) {
    return res.send('User already verified');
  }

  if (user.verificationCode === verificationCode) {
    user.verified = true;

    await user.save();

    return res.send('Successfully verified user');
  }

  return res.send('Could not verify user');
};

export const forgotPasswordHandler = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response) => {
  const { email } = req.body;

  const message = 'If a user with that email is registered, you will receive an email with password reset instructions';

  const user = await findByEmail(email);

  if (!user) {
    log.debug(`User with email: ${email} does not exist`);
    return res.send(message);
  }

  if (!user.verified) {
    return res.send('User is not verified');
  }

  const passwordResetCode = nanoid();

  user.passwordResetCode = passwordResetCode;

  await user.save();

  await sendEmail({
    from: 'test@example.com',
    to: user.email,
    subject: 'Reset your password',
    text: `Password reset code: ${passwordResetCode}, id: ${user._id}`,
  });

  log.debug(`Password reset code sent to ${email}`);

  return res.send(message);
};

export const resetPasswordHandler = async (
  req: Request<ResetPasswordInput['params'], {}, ResetPasswordInput['body']>,
  res: Response
) => {
  const { id, passwordResetCode } = req.params;

  const { password } = req.body;

  const user = await findUserById(id);

  if (!user || !user.passwordResetCode || user.passwordResetCode !== passwordResetCode) {
    return res.status(400).send('Could not reset user password');
  }

  user.passwordResetCode = null;

  user.password = password;

  await user.save();

  return res.send('User password reset successful!');
};

export const getCurrentUserHandler = async (_req: Request, res: Response) => {
  return res.locals['user'];
};
