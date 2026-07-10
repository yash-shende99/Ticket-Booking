"use server";

import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function sendTicketEmail(bookingId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    if (!userEmail) return { error: "You must be logged in to send an email. (Session not found)" };

    await dbConnect();
    const booking = await Booking.findById(bookingId).populate("trainId");
    if (!booking) return { error: "Booking not found." };

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return { error: "SMTP credentials are missing. Please add them to your .env file." };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort) || 587,
      secure: Number(smtpPort) === 465, 
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const train = booking.trainId;

    const emailContent = `
      <h1>RailConnect E-Ticket</h1>
      <p>Dear Passenger,</p>
      <p>Your ticket is confirmed!</p>
      <h2>Booking Details</h2>
      <ul>
        <li><strong>PNR Number:</strong> ${booking.pnr}</li>
        <li><strong>Train:</strong> ${train.trainNumber} - ${train.name}</li>
        <li><strong>Date of Journey:</strong> ${new Date(booking.journeyDate).toDateString()}</li>
        <li><strong>Class:</strong> ${booking.seatClass}</li>
        <li><strong>Passengers:</strong> ${booking.passengers.length}</li>
      </ul>
      <h2>Fare Details</h2>
      <p><strong>Total Amount Paid:</strong> ₹${booking.pricePaid}</p>
      <br />
      <p>Thank you for choosing RailConnect. Have a safe journey!</p>
    `;

    const info = await transporter.sendMail({
      from: `"RailConnect" <${smtpUser}>`,
      to: userEmail,
      subject: `RailConnect E-Ticket: PNR ${booking.pnr}`,
      html: emailContent,
    });

    return { success: true, messageId: info.messageId };

  } catch (error: any) {
    console.error("Email Error:", error);
    return { error: error.message || "Failed to send email." };
  }
}

export async function sendTicketSMS(bookingId: string) {
  try {
    await dbConnect();
    const booking = await Booking.findById(bookingId).populate("trainId");
    if (!booking) return { error: "Booking not found." };

    const contactNumber = booking.emergencyContact;
    if (!contactNumber) return { error: "No emergency contact number found for this booking." };

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioSid || !twilioToken || !twilioPhone || twilioSid === "placeholder") {
      return { error: "Twilio API Keys are missing. Please add them to your .env file." };
    }

    const client = twilio(twilioSid, twilioToken);
    const train = booking.trainId;

    const messageBody = `RailConnect: Your ticket is confirmed. PNR: ${booking.pnr}. Train: ${train.trainNumber}. Date: ${new Date(booking.journeyDate).toDateString()}. Passengers: ${booking.passengers.length}. Happy Journey!`;

    // Ensure contact number has country code for Twilio
    const formattedNumber = contactNumber.startsWith('+') ? contactNumber : `+91${contactNumber}`;

    const message = await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: formattedNumber,
    });

    return { success: true, messageId: message.sid };

  } catch (error: any) {
    console.error("SMS Error:", error);
    return { error: error.message || "Failed to send SMS." };
  }
}
