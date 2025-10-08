export const resetPasswordBody = ({
  name,
  token,
  link,
}: {
  name: string;
  token: string;
  link: string;
}): string => {
  return `
<p>Hi, ${name}.</p>

<p>Ignore this message if you didn't request a password reset. 
You can either click the button below to continue in your browser, 
or enter the reset token in the password reset form.</p>

<p style="font-weight: bold; font-size: 18px; color: #1f640eff;">
  Reset Token: ${token}
</p>

<a href="${link}" class="button">Reset Password</a>

<p>If the button doesn't work, copy and paste this link into your browser:</p>
<p>${link}</p>
`;
};
