import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const settings = await db.systemSettings.findFirst();

    if (!settings) {
        // Fallback default settings if none exist
        return NextResponse.json({
            success: true,
            data: {
                companyName: 'Air Kita',
                companyEmail: 'admin@airkita.com',
                companyPhone: '+62 812-3456-7890',
                companyAddress: 'Jl. Contoh No. 123',
                companyLogo: null,
            }
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        companyName: settings.companyName,
        companyEmail: settings.companyEmail,
        companyPhone: settings.companyPhone,
        companyAddress: settings.companyAddress,
        companyLogo: settings.companyLogo,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
