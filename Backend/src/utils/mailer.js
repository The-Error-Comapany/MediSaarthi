import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const { GMAIL_USER , GMAIL_PASS} = process.env;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    return await transporter.sendMail({
      from: `"MediSaarthi" <${GMAIL_USER}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ""),
      html,
    });
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
};

export const sendOtpMail = async (to, name, otp) => {
  await transporter.sendMail({
    from: `"MediSaarthi" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your MediSaarthi OTP",
    html: `
      <h3>Hello ${name},</h3>
      <p>Your OTP for email verification is:</p>
      <h2 style="letter-spacing:2px;">${otp}</h2>
      <p>This OTP is valid for <b>10 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};


