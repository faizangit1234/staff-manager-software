const transporter = require("../config/nodeMailer.js");

const sendScheduleEmail = async ({ to, type, schedule }) => {
  let subject = "";
  let html = "";

  const { clientName, date, startTime, endTime, destination, service, status } =
    schedule;

  const formattedDate = new Date(date).toLocaleDateString();

  switch (type) {
    case "created":
      subject = "Your Schedule is Confirmed!";
      html = `
        <h2>Schedule Confirmed</h2>
        <h2>Client Name : ${clientName}<h2>
        <p>Your schedule has been confirmed for <strong>${formattedDate}</strong>.</p>
        <ul>
          <li>Time: ${startTime} - ${endTime}</li>
          <li>Destination: ${destination}</li>
          <li>Service: ${service}</li>
        </ul>
        <p>Status: ${status}</p>
        <p>Thank you for choosing Our Platform!</p>
      `;
      break;

    case "cancelled":
      subject = "Your Schedule has been Cancelled";
      html = `
        <h2>Schedule Cancelled,</h2>
        <p>We regret to inform you that your scheduled booking on <strong>${formattedDate}</strong> with client <strong>${clientName}</strong> has been cancelled.</p>
        <p>If you have any questions, please contact us.</p>
      `;
      break;

    case "rescheduled":
      subject = "Your Schedule has been Rescheduled";
      html = `
        <h2>Hello ${clientName},</h2>
        <p>Your schedule has been updated:</p>
        <ul>
          <li>New Date: ${formattedDate}</li>
          <li>Time: ${startTime} - ${endTime}</li>
          <li>Destination: ${destination}</li>
          <li>Service: ${service}</li>
        </ul>
        <p>Status: ${status}</p>
        <p>We look forward to serving you!</p>
      `;
      break;

    default:
      return; // do nothing
  }

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendScheduleEmail;
