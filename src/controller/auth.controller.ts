import { Request, Response } from 'express';
import { get } from 'lodash';
import { CreateSessionInput } from 'src/schema/auth.schema';
import { findSessionById, signAccessToken } from 'src/service/auth.service';
// import { signRefreshToken, signAccessToken } from 'src/service/auth.service';
import { findByEmail, findUserById } from 'src/service/user.service';
import { verifyJwt } from 'src/utils/jwt';

export const createSessionHandler = async (req: Request<{}, {}, CreateSessionInput>, res: Response) => {
  const { email, password } = req.body;

  const message = 'Invalid email or password';

  const user = await findByEmail(email);

  if (!user) {
    return res.send(message);
  }

  if (!user.verified) {
    return res.send('Please verify your email');
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return res.send(message);
  }

  const accessToken = signAccessToken(user);

  // const refreshToken = await signRefreshToken({ userId: String(user._id) });

  return res.send(accessToken);
};

export const refreshAccessTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = get(req, 'headers.x-refresh');

  if (refreshToken !== '') {
    return res.status(401).send('Could not refresh token');
  }

  const decoded = verifyJwt<{ session: string }>(refreshToken, 'refreshTokenPublicKey');

  if (!decoded) {
    return res.status(401).send('Could not refresh token');
  }

  const session = await findSessionById(decoded.session);

  if (!session || !session.valid) {
    return res.status(401).send('Could not refresh token');
  }

  const user = await findUserById(String(session.user));

  if (!user) {
    return res.status(401).send('Could not refresh token');
  }

  const accessToken = signAccessToken(user);

  return res.send({ accessToken });
};
