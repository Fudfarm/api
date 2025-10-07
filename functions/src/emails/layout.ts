export const emailLayout = ({
  title,
  body,
  year = new Date().getFullYear(),
  appName,
}: {
  title: string;
  body: string;
  year?: number;
  appName: string;
}): string => {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f5f5f5;
        padding: 0;
        margin: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 30px auto;
        background: #ffffff;
        padding: 30px;
        border-radius: 8px;
        border: 1px solid #eee;
      }
      h1 {
        color: #22876d;
        margin-top: 0;
      }
      .button {
        display: inline-block;
        background-color: #22876d !important;
        color: #ffffff !important;
        border: none;
        padding: 12px 20px;
        margin: 20px 0;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
      }
      p {
        font-size: 15px;
        line-height: 1.6;
        color: #333;
      }
      .footer {
        font-size: 12px;
        color: #999;
        margin-top: 30px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <h1>${title}</h1>
      ${body}
      <div class="footer">
        <p>&copy; ${year} ${appName}. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;
};
