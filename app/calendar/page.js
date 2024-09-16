"use client"
import Link from "next/link";
import React, { useState } from "react";

const Page = () => {
  const [country, setCountry] = useState("US");
  const [year, setYear] = useState("2024");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);

  const countries = ["US", "CA", "GB", "AU", "IN"]; // Example countries
  const years = ["2020", "2021", "2022", "2023", "2024", "2025"];

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const apiUrl = `/api/holidays?country=${country}&year=${year}`;
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setHolidays(data); // Store the full array of holiday objects
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
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-2 border rounded text-black"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
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
        <p className="text-white">Loading holidays...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {holidays.map((holiday, index) => (
            <div key={index} className="bg-white shadow-md rounded-lg p-6 text-black">
              <h2 className="text-xl font-semibold mb-2">{holiday.name}</h2>
              <p><span className="font-medium">Date:</span> {holiday.date}</p>
              <p><span className="font-medium">Day:</span> {holiday.day}</p>
              <p><span className="font-medium">Country:</span> {holiday.country} ({holiday.iso})</p>
              <p><span className="font-medium">Year:</span> {holiday.year}</p>
              <p><span className="font-medium">Type:</span> {holiday.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;