export const staffOnboardingWelcomeBody = ({
  name,
}: {
  name: string;
}): string => {
  return `
<p>Hi, ${name}.</p>

<p>Welcome to the team! We're excited to have you join us and look forward to working together. 
Before you can access your account, please reset your password through the app 
or website using the link sent to your email. 
If you experience any issues, don't hesitate to reach out to your manager 
or the HR department for assistance.</p>

<p>Once your password has been set, be sure to complete any pending onboarding tasks 
and take some time to get familiar with our company policies and culture. 
We're confident that you'll make a valuable contribution to the team. 
Once again, welcome aboard!</p>

<p>Best regards,<br/>The Team</p>
`;
};
