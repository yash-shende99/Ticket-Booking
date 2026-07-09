import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Station } from "@/models/Station";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    await dbConnect();

    // Find stations matching query (case-insensitive regex)
    // Limit to 10 results for performance
    const stations = await Station.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { code: { $regex: query, $options: "i" } },
        { city: { $regex: query, $options: "i" } }
      ]
    })
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, stations });
  } catch (error: any) {
    console.error("API error fetching stations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
