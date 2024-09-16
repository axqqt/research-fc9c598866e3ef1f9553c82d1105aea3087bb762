"use server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country') || 'US';
  const year = searchParams.get('year') || '2024';
  const holidayType = searchParams.get('holidaytype') || 'all';

  try {
    let apiUrl = `https://api.api-ninjas.com/v1/holidays?country=${country}&year=${year}`;
    
    // Add the holiday type to the API URL if it's not 'all'
    if (holidayType !== 'all') {
      apiUrl += `&type=${holidayType}`;
    }

    const response = await fetch(
      apiUrl,
      {
        headers: {
          'X-Api-Key': process.env.holidayKey,  // API key from env variables
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json(
      { error: "Failed to fetch holidays" },
      { status: 500 }
    );
  }
}