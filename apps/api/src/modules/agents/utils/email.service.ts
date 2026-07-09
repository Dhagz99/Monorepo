import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendAgentApprovalEmail = async (
  email: string,
  fullName: string,
  username: string,
  temporaryPassword: string
) => {
  await transporter.sendMail({
    from: `"Jamero Group of Companies" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Agent Account Approved",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h2 style="color: #2E7D32;">
          Account Approved
        </h2>

        <p>Dear <strong>${fullName}</strong>,</p>

        <p>
          We are pleased to inform you that your agent account registration has been approved.
        </p>

        <p>
          You may now log in to the Agent Management System using the credentials below:
        </p>

        <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              Username
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>${username}</strong>
            </td>
          </tr>

          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">
              Temporary Password
            </td>
            <td style="padding: 10px; border: 1px solid #ddd;">
              <strong>${temporaryPassword}</strong>
            </td>
          </tr>
        </table>

        <p>
          For security purposes, please change your password immediately after your first login.
        </p>

        <p>
          If you did not request this account, please contact the administrator immediately.
        </p>

        <br/>

        <p>
          Regards,<br/>
          <strong>Jamero Group of Companies</strong>
        </p>

      </div>
    `,
  });
};