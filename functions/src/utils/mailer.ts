import nodemailer from "nodemailer";
import { emailLayout } from "../emails/layout";
import { config } from "../config";

type EmailOptions = {
  to: string;
  subject: string;
  title: string;
  body: string;
  appName?: string;
};

export const sendEmail = async ({
  to,
  subject,
  title,
  body,
  appName = config.appName,
}: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: config.emailHost,
    port: Number(config.emailPort),
    secure: config.emailSecure,
    auth: {
      user: config.emailUsername,
      pass: config.emailPassword,
    },
  });

  const html = emailLayout({ title, body, appName });

  await transporter.sendMail({
    from: `"${config.appName} Support" <${config.emailUsername}>`,
    to,
    subject,
    html,
  });
};
