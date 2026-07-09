import { Prisma } from "@prisma/client";


import nodemailer from "nodemailer";

export async function createNextCycle(
  tx: Prisma.TransactionClient,

  cycle: {
    agentId: string;
    cycleMonth: number;
    cycleYear: number;
  }
) {

  const nextDate =
    new Date(
      cycle.cycleYear,
      cycle.cycleMonth,
      1
    );

  const nextMonth =
    nextDate.getMonth() + 1;

  const nextYear =
    nextDate.getFullYear();

  const existingCycle =
    await tx.agentMaintenanceCycle.findFirst({
      where: {
        agentId:
          cycle.agentId,

        cycleMonth:
          nextMonth,

        cycleYear:
          nextYear,
      },
    });

  if (existingCycle) {
    return;
  }

  await tx.agentMaintenanceCycle.create({
    data: {

      agentId:
        cycle.agentId,

      cycleMonth:
        nextMonth,

      cycleYear:
        nextYear,

      cycleStartDate:
        new Date(
          nextYear,
          nextMonth - 1,
          1
        ),

      cycleEndDate:
        new Date(
          nextYear,
          nextMonth,
          0
        ),

      requiredSales: 1,

      completedSales: 0,

      remainingSales: 1,

      isCompleted: false,

      status: "ACTIVE",
    },
  });
}




const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendExpiringAgentEmail = async (
  email: string,
  expiredDays: number,
  fullName: string,
) => {
  await transporter.sendMail({
    from: `"Jamero Group of Companies" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Agent Account Approved",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h2 style="color: #2E7D32;">
         DEACTIVATION WARNING
        </h2>

        <p>Dear <strong>${fullName}</strong>,</p>

        <p>
          You are now at ${expiredDays} days since your account expired. Please complete your sales requirements or request reactivation to avoid permanent deactivation.
        </p>

        <p>
          You may reach out to your branch for additional details and clarification:
        </p>

       
        <p>
          For security purposes, please change your password immediately after your first login.
        </p>

        <p>
          If you did not request this account, please contact the administrator immediately.
        </p>

        <br/>

        <p>
          Regards,<br/>
          <strong>Operation Department</strong>
        </p>

      </div>
    `,
  });
};

export const sendDownlineEmail = async (
  email: string,
  uplinefullName: string,
  expiredDays: number,
  fullName: string,
) => {
  await transporter.sendMail({
    from: `"Jamero Group of Companies" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Agent Account Approved",

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h2 style="color: #2E7D32;">
         DEACTIVATION WARNING
        </h2>

        <p>Dear <strong>${fullName}</strong>,</p>

        <p>
          Your upline ${uplinefullName} is now at ${expiredDays} days since account expiration and may be permanently deactivated soon.
        </p>

        <p>
          You may reach out to your branch for additional details and clarification:
        </p>

       
        <p>
          For security purposes, please change your password immediately after your first login.
        </p>

        <p>
          If you did not request this account, please contact the administrator immediately.
        </p>

        <br/>

        <p>
          Regards,<br/>
          <strong>Operation Department</strong>
        </p>

      </div>
    `,
  });
};