"use client"
import Link from "next/link";
import React, { useState, useEffect } from "react";

const Page = () => {
  const currentYear = new Date().getFullYear().toString();
  const [country, setCountry] = useState("US");
  const [year, setYear] = useState(currentYear);
  const [holidayType, setHolidayType] = useState("all");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const countries = ["US", "CA", "GB", "AU", "IN"];
  const years = Array.from({length: 6}, (_, i) => (parseInt(currentYear) + i - 1).toString());
  const holidayTypes = [
    "all",
    "public_holiday",
    "national_holiday",
    "federal_holiday",
    "observance",
    "state_holiday",
    "optional_holiday",
    "clock_change_daylight_saving_time",
    "local_holiday",
    "united_nations_observance",
    "bank_holiday",
    "common_local_holiday",
    "christian",
    "jewish_holiday",
    "muslim",
    "hindu_holiday",
    "restricted_holiday",
    "official_holiday",
    "local_observance"
  ];

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/holidays?country=${country}&year=${year}&holidaytype=${holidayType}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const currentDate = new Date();
      const sortedHolidays = data
        .filter(holiday => new Date(holiday.date) >= currentDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setHolidays(sortedHolidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHolidays();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Holiday Finder</h1>
      <Link href={"/"}>Back to Homepage</Link>
      <br /> <br />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-4">
        <div className="flex gap-4">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="p-2 border rounded text-black"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border rounded text-black"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={"observance"}
            onChange={(e) => setHolidayType(e.target.value)}
            className="p-2 border rounded text-black"
          >
            {holidayTypes.map((type) => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Find Holidays
        </button>
      </form>
      {loading ? (
        <p className="text-black">Loading holidays...</p>
      ) : (
        <div className="space-y-4">
          {holidays.map((holiday, index) => (
            <div 
              key={index} 
              className={`bg-white shadow-md rounded-lg p-6 text-black ${index === 0 ? 'border-2 border-blue-500' : ''}`}
            >
              <h2 className="text-xl font-semibold mb-2">{holiday.name}</h2>
              <p><span className="font-medium">Date:</span> {holiday.date}</p>
              <p><span className="font-medium">Day:</span> {holiday.day}</p>
              <p><span className="font-medium">Country:</span> {holiday.country} ({holiday.iso})</p>
              <p><span className="font-medium">Year:</span> {holiday.year}</p>
              <p><span className="font-medium">Type:</span> {holiday.type}</p>
              {index === 0 && <p className="mt-2 text-blue-500 font-bold">Next Upcoming Holiday</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;