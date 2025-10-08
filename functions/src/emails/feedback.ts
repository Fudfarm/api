// System email for feedback bot
export const feedbackBotSystemEmailBody = ({
  fullname,
  email,
  phone,
  body,
  rating,
  type,
}: {
  fullname: string;
  email: string;
  phone: string;
  body: string;
  rating: number;
  type: string;
}): string => `
<p>New feedback/contact bot message received:</p>
<p><strong>Full Name:</strong> ${fullname}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone}</p>
<p><strong>Type:</strong> ${type}</p>
<p><strong>Rating:</strong> ${rating} / 5</p>
<p><strong>Message:</strong><br/>${body}</p>
`;

// User confirmation email
export const feedbackBotUserEmailBody = ({
  fullname,
  type,
}: {
  fullname: string;
  type: string;
}): string => `
<p>Hi ${fullname},</p>
<p>Thank you for submitting your feedback regarding "<strong>${type}</strong>". 
We have received your message and will get back to you as soon as possible.</p>
<p>Best regards,<br/>The Team</p>
`;
