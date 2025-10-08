// Email to the system/support
export const contactUsSystemEmailBody = ({
  fullname,
  email,
  phone,
  title,
  message,
  appName,
}: {
  fullname: string;
  email: string;
  phone: string;
  title: string;
  message: string;
  appName: string;
}): string => {
  return `
<p>You have received a new contact message from your ${appName}:</p>

<p><strong>Full Name:</strong> ${fullname}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Title:</strong> ${title}</p>
<p><strong>Message:</strong><br/>${message}</p>

<p>Best regards,<br/>Your ${appName}</p>
`;
};

// Confirmation email to the user
export const contactUsUserEmailBody = ({
  fullname,
  title,
}: {
  fullname: string;
  title: string;
}): string => {
  return `
<p>Hi ${fullname},</p>

<p>Thank you for reaching out to us regarding "<strong>${title}</strong>". 
We have received your message and will get back to you as soon as possible.</p>

<p>Best regards,<br/>The Support Team</p>
`;
};
