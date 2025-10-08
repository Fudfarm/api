export const passwordResetSuccessfulBody = ({
  name,
}: {
  name: string;
}): string => {
  return `
<p>Hi, ${name}.</p>

<p>Your password has been successfully reset. 
If you did not perform this action, please contact our support team immediately.</p>

<p>Best regards,<br/>The Team</p>
`;
};
