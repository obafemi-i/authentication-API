import nodemailer, { SendMailOptions } from 'nodemailer';
import config from 'config';
import log from './logger';

// const createTestCruds = async () => {
//   const cred = await nodemailer.createTestAccount();
//   // eslint-disable-next-line no-console
//   console.log({ cred });
// };

// createTestCruds();

const smtp = config.get<{
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}>('smtp');

const transporter = nodemailer.createTransport({ ...smtp, auth: { user: smtp.user, pass: smtp.pass } });

const sendEmail = async (payload: SendMailOptions) => {
  transporter.sendMail(payload, (error, info) => {
    if (error) {
      log.error(error, 'Error sending email');
      return;
    }
    log.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  });
};

export default sendEmail;
