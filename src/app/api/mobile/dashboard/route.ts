import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // 1. Total Active Customers
    const totalCustomers = await db.customer.count({
      where: {
        status: "ACTIVE",
      },
    });

    // 2. Count recorded readings for this month
    const recordedCount = await db.meterReading.count({
      where: {
        month: month,
        year: year,
      },
    });

    // 3. Calculate pending
    const pendingCount = Math.max(0, totalCustomers - recordedCount);

    // 4. Calculate progress percentage
    const progress = totalCustomers > 0 
      ? Math.round((recordedCount / totalCustomers) * 100) 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        recordedCount,
        pendingCount,
        progress,
        month,
        year,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
