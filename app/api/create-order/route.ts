import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Booking } from "@/models/Booking";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    await dbConnect();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    });

    // Razorpay amount is in paise (multiply by 100)
    const amountInPaise = Math.round(booking.pricePaid * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${booking._id.toString()}`,
      payment_capture: 1 // Auto capture
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return NextResponse.json({ error: "Failed to create Razorpay order" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder"
    });

  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
