"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo, faNoteSticky } from "@fortawesome/free-solid-svg-icons";

const sheetId = "1tgYXbj5NY_GPK76CbHPp4RT6H0y-p1s1qthFI0A0KGI";
const sheetName = "FOR 200";
const columns = [
  "Date",
  "Term and Semester",
  "Student Number",
  "Category",
  "Remarks",
];

function parseSheetDate(value) {
  if (!value) return 0;

  const parts = String(value).split(/[\/\s:]+/);
  const [month, day, year, hour = "00", minute = "00", second = "00"] = parts;
  const parsed = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );

  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function ReadableDate({ value }) {
  const timestamp = parseSheetDate(value);

  if (!timestamp) {
    return <span>{value || "No date"}</span>;
  }

  const date = new Date(timestamp);
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return <time dateTime={value}>{formattedDate}</time>;
}

function RemarkBadge({ value }) {
  const remark = String(value || "").trim();
  const normalized = remark.toLowerCase();

  if (!remark) {
    return <span className="text-yellow-600 font-semibold">In Progress</span>;
  }

  if (
    normalized.includes("approved") ||
    normalized.includes("complied") ||
    normalized.includes("signed")
  ) {
    return <span className="text-green-600 font-semibold">{remark}</span>;
  }

  if (
    normalized.includes("resubmit") ||
    normalized.includes("revise") ||
    normalized.includes("revision")
  ) {
    return <span className="text-red-600 font-semibold">{remark}</span>;
  }

  return <span className="text-gray-800 font-medium">{remark}</span>;
}

function CellValue({ column, entry }) {
  if (column === "Date") {
    return <ReadableDate value={entry[column]} />;
  }

  if (column === "Remarks") {
    return <RemarkBadge value={entry[column]} />;
  }

  return entry[column] || "-";
}

export default function Home() {
  const [trackerNumber, setTrackerNumber] = useState("");
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sortedResults = useMemo(
    () =>
      [...results].sort(
        (a, b) => parseSheetDate(b["Date"]) - parseSheetDate(a["Date"])
      ),
    [results]
  );

  const fetchStatus = async () => {
    const [studentNumber = "", firstNameCode = ""] = trackerNumber
      .trim()
      .split("-");

    if (!studentNumber || firstNameCode.length < 2) {
      setResults([]);
      setMessage("Enter a valid tracker number, for example 202512345-AN.");
      return;
    }

    setLoading(true);
    setResults([]);
    setMessage("");

    try {
      const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Unable to read the sheet.");
      }

      const data = await res.json();
      const matches = data.filter((row) => {
        const rowStudentNumber = String(row["Student Number"] || "").trim();
        const rowFirstName = String(row["First Name"] || "").trim();

        return (
          rowStudentNumber === studentNumber.trim() &&
          rowFirstName.slice(0, 2).toUpperCase() ===
            firstNameCode.slice(0, 2).toUpperCase()
        );
      });

      if (!matches.length) {
        setMessage("No record found.");
      }

      setResults(matches);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(30deg,#04543c_50%,#ffffff_50%)]">
      <header
        className="w-full text-white flex justify-between items-center gap-4 px-4 sm:px-6 py-3 shadow"
        style={{ backgroundColor: "#8d1635" }}
      >
        <h1 className="text-lg sm:text-xl font-bold">FOR 200 Tracker</h1>
        <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
      </header>

      <div className="mt-5 mx-4 bg-white shadow-md border border-gray-200 rounded-lg px-4 py-3 text-gray-700 flex items-start gap-3 max-w-2xl sm:mx-auto">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="text-blue-600 w-5 h-5 mt-1 shrink-0"
        />
        <p className="text-sm sm:text-md">
          Enter your tracker number in the format <strong>202512345-AN</strong>{" "}
          (Student Number + first two letters of your first name). <br />
          Then click <strong>Check Status</strong> to view your records. The
          latest record is shown first.
        </p>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center px-4 py-6 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3 w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter Tracker Number (e.g., 202512345-AN)"
            value={trackerNumber}
            onChange={(e) => setTrackerNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") fetchStatus();
            }}
            className="border p-2 text-black rounded flex-1 w-full bg-white"
          />

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="text-white px-4 py-2 rounded-lg w-full sm:w-auto border border-white hover:border-gray-200 disabled:opacity-70"
            style={{ backgroundColor: "#04543c" }}
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>

        {message && (
          <div className="mt-6 bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded relative shadow-sm max-w-lg w-full">
            {message}
          </div>
        )}

        {sortedResults.length > 0 && (
          <div className="mt-6 w-full max-w-6xl">
            <div style={{ color: "#333" }}>
              <h2 className="font-semibold mb-3 text-white">Results:</h2>

              <div className="md:hidden space-y-3">
                {sortedResults.map((entry, idx) => (
                  <article
                    key={`${entry["Date"]}-${idx}-mobile`}
                    className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 bg-gray-100 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {entry["Category"] || "Record"}
                        </p>
                        <p className="text-base font-semibold text-gray-900 break-words">
                          <CellValue column="Remarks" entry={entry} />
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 text-right shrink-0">
                        #{idx + 1}
                      </p>
                    </div>

                    <dl className="divide-y divide-gray-200">
                      {columns
                        .filter((column) => column !== "Category")
                        .map((column) => (
                          <div
                            key={column}
                            className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 px-4 py-3"
                          >
                            <dt className="text-xs font-semibold uppercase text-gray-500">
                              {column === "Remarks"
                                ? "Status / Remarks"
                                : column}
                            </dt>
                            <dd className="text-sm text-gray-900 break-words">
                              <CellValue column={column} entry={entry} />
                            </dd>
                          </div>
                        ))}
                    </dl>
                  </article>
                ))}
              </div>

              <div className="hidden md:block overflow-x-auto w-full">
                <table className="table-auto min-w-[820px] w-full border-collapse border border-gray-300 bg-white shadow-sm rounded text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="border border-gray-300 px-4 py-2 text-left"
                        >
                          {column === "Remarks" ? "Status / Remarks" : column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((entry, idx) => (
                      <tr
                        key={`${entry["Date"]}-${idx}`}
                        className="hover:bg-gray-50"
                      >
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="border border-gray-300 px-4 py-2 align-top"
                          >
                            <CellValue column={column} entry={entry} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-white text-md flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faNoteSticky}
                  className="text-white w-4 h-4"
                />
                For pickup, resubmission, or other instructions, follow the
                latest status or remarks shown above.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
