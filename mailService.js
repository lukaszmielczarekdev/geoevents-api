import * as dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

OAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

const accessToken = new Promise((resolve, reject) => {
  OAuth2Client.getAccessToken((error, token) => {
    if (error) reject(error);
    resolve(token);
  });
});

export const passwordChangeConfirmationMailTemplate = (link, name, email) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <header>
      <h1>GeoEvents</h1> 
      <h2>Password reset</h2>
    </header>
    <main>
    <article>
      <br />
      <p>Hello ${name},
      <br /><br />
      Your password for the GeoEvents account associated with ${email} has been successfully changed.
      <br /><br /><br />
      If you did not change your password, please let us know immediately by replying to this email.
      <br /><br />
      Yours,<br />
      The GeoEvents team
      <br />
      <hr />
      </p>
    </article>
    </main>
    <footer><a href=${link}>GeoEvents Homepage</a></footer>
  </body>
</html>`;

export const passwordResetRequestMailTemplate = (link, name, email) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      .button {
        background-color: rgb(125, 215, 120);
        border: none;
        border-radius: 10px 0;
        color: white;
        font-size: 1rem;
        padding: 0.8rem;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        margin: 0.5rem 0;
        cursor: pointer;
            }
</style>
  </head>
  <body>
    <header>
      <h1>GeoEvents</h1> 
      <h2>Password reset</h2>
    </header>
    <main>
    <article>
      <br />
      <p>Hello ${name},
      <br /><br />
      Somebody requested a new password for the GeoEvents account associated with ${email}.
      <br /><br />
      No changes have been made to your account yet.
      <br /><br />
      You can reset your password by clicking the link below: *
      <br /><br />
      <a href=${link} class="button">Reset password</a>
      <br /><br />
      or copy the link to the browser: *
      <br /><br />
      <a href=${link} >${link}</a>
      <br /><br /><br />
      If you did not request a new password, please let us know immediately by replying to this email.
      <br /><br />
      * The password reset link is only valid for the next 15 minutes.
      <br /><br />
      Yours,<br />
      The GeoEvents team
      <br />
      <hr />
      </p>
    </article>
    </main>
    <footer><a href="https://geoevents.pages.dev">GeoEvents Homepage</a></footer>
  </body>
</html>`;

export const newsletterSubscribeMailTemplate = (link, name) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <header>
      <h1>GeoEvents</h1> 
      <h2>Newsletter Subscription</h2>
    </header>
    <main>
    <article>
      <br />
      <p>Hello ${name},
      <br /><br />
      Thank you for subscribing to the newsletter.
      <br /><br />
      Like you, we don't like spam, so we'll only keep you posted on the most important events.
      <br /><br />
      You can unsubscribe at any time in your account settings, by clicking on the link below or replying to this email.
      <br /><br /><br />
      If you did not subscribe, please let us know immediately.
      <br /><br />
      Yours,<br />
      The GeoEvents team
      <br />
      <hr />
      </p>
    </article>
    </main>
    <footer><a href=${link}>Unsubscribe</a><br /><br /><a href="https://geoevents.pages.dev">GeoEvents Homepage</a></footer>
  </body>
</html>`;

export const messageConfirmationTemplate = (username, email, message) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <header>
      <h1>GeoEvents</h1> 
      <h2>Hello ${username}</h2>
      <h3>Thank you for your message</h3>
    </header>
    <main>
    <article>
    <p>
      You have sent us a message with the following content by providing this email (${email}) in the form on our website:
      <br />
      <br />
      ${message}
      <br /><br />
      <hr /><br />
      The GeoEvents team
      <br />
      <br />
    </p>
    </article>
    </main>
    <footer><a href="https://geoevents.pages.dev">GeoEvents Homepage</a></footer>
  </body>
</html>`;

export const feedbackTemplate = (username, email, message) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <header>
      <h1>GeoEvents</h1> 
      <h2>A message from ${username}</h2>
    </header>
    <main>
    <article>
      <p>
      Message content:
      <br />
      <br />
      ${message}
      <br /><br />
      Sender ${email}
      <br />
      <hr />
      </p>
    </article>
    </main>
    <footer><a href="https://geoevents.pages.dev">GeoEvents Homepage</a></footer>
  </body>
</html>`;

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    type: "OAuth2",
    user: "daily.diet.team@gmail.com",
    clientId: process.env.GMAIL_CLIENT_ID,
    accessToken,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});
