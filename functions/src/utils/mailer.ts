import nodemailer from "nodemailer";
import { emailLayout } from "../emails/layout";
import { config } from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  title: string;
  body: string;
  appName?: string;
  cc?: string | string[]; // Optional single email or array of emails
}

export const sendEmail = async ({
  to,
  subject,
  title,
  body,
  appName = config.appName,
  cc,
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
    cc, // Nodemailer will ignore if undefined
    subject,
    html,
  });
};
