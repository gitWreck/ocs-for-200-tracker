"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faNoteSticky, faCircleInfo } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  const [trackerNumber, setTrackerNumber] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    if (!trackerNumber) return;

    setLoading(true);
    setResults([]);

    try {
      // Replace with your actual Google Sheet ID and sheet name
      const sheetId = "1tgYXbj5NY_GPK76CbHPp4RT6H0y-p1s1qthFI0A0KGI";
      const sheetName = "Manuscript";
      const url = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;

      const res = await fetch(url);
      const data = await res.json();

      const [studentNum, code] = trackerNumber.split("-");

      // Get all matching records
      const matches = data.filter(
        (row) =>
          row["Student Number"] === studentNum &&
          row["First Name"].substring(0, 2).toUpperCase() === code.toUpperCase()
      );

      setResults(matches.length > 0 ? matches : [{ error: "No record found" }]);
      console.log(matches);
    } catch (err) {
      console.error(err);
      setResults([{ error: "Error fetching data" }]);
    } finally {
      setLoading(false);
    }
  };

  function FixedReadableDate({ dateString }) {
    // 1. Manually parse and reformat the string into ISO 8601 (YYYY-MM-DD HH:mm:ss)
    const parts = dateString.split(/[\/\s:]+/); // Split by /, space, or :

    const [month, day, year, hour, minute, second] = parts;

    // Create a new string in YYYY-MM-DDTHH:mm:ss format
    // This format is universally accepted by new Date()
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    // 2. Now, new Date() will reliably parse the standardized string
    const date = new Date(isoString);

    // 3. Check if the parsing was successful before formatting
    if (isNaN(date.getTime())) {
      return <span>Error: Invalid Date Input</span>;
    }

    // 4. Proceed with formatting (using the robust Intl API)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const formattedDate = new Intl.DateTimeFormat(undefined, options).format(
      date
    );

    return <time dateTime={dateString}>{formattedDate}</time>;
  }

  return (
    <main
      // className="min-h-screen bg-white"
      className="min-h-screen bg-[linear-gradient(30deg,#04543c_50%,#ffffff_50%)]"
    >
      {/* <main className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-b from-white 50% to-gray-100 50%"> */}
      {/* 🔹 HEADER BAR */}
      <header
        className="w-full bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow"
        style={{ backgroundColor: "#8d1635" }} // custom color
      >
        <h1 className="text-xl font-bold">FOR 200 Status Tracker</h1>
        <img
          src="/logo.png" // put your logo inside public/logo.png
          alt="Logo"
          className="h-10 w-auto"
        />
      </header>
      {/* Instructions */}

      <div className="mt-5 bg-white shadow-md border border-gray-200 rounded-lg px-4 py-3 text-gray-700 flex items-start gap-3 max-w-2xl mx-auto">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="text-blue-600 w-5 h-5 mt-1"
        />
        <p className="text-md">
          Enter your tracker number in the format <strong>202512345-AN</strong>{" "}
          (Student Number + first two letters of your first name). <br />
          Then click <strong>Check Status</strong> to view your status. <br />
          <strong>For Proposals,</strong>
          in case where you have resubmissions, the <strong>
            {" "}
            top value
          </strong>{" "}
          is the latest status.
        </p>
      </div>
      {/* 🔹 CONTENT */}
      <div className="mt-5 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-3 w-full max-w-lg">
          <input
            type="text"
            placeholder="Enter Tracker Number (e.g., 202512345-AN)"
            value={trackerNumber}
            onChange={(e) => setTrackerNumber(e.target.value)}
            className="border p-2 text-black rounded flex-1 w-full bg-white"
          />

          <button
            onClick={fetchStatus}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto border-1 border-white hover:border-gray-200"
            style={{ backgroundColor: "#04543c" }}
          >
            {loading ? "Checking..." : "Check Status"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-6 w-full max-w-full">
            {" "}
            {/* make container full width */}
            {results[0]?.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-sm">
                <strong className="font-semibold">Error: </strong>
                {results[0].error}
              </div>
            ) : (
              <div style={{ color: "#333" }}>
                <h2 className="font-semibold mb-3 text-white">Results:</h2>

                {/* Responsive wrapper: ensures horizontal scrolling on narrow screens */}
                <div
                  className="overflow-x-auto w-full -mx-4 px-4"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  <table className="table-auto min-w-[700px] w-full border-collapse border border-gray-300 bg-white shadow-sm rounded text-sm sm:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Date
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Student Number
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Term and Semester
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Category
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {results
                        .sort(
                          (a, b) => new Date(b["Date"]) - new Date(a["Date"])
                        )
                        .map((entry, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                              {/* Correct: Render the component as a JSX element */}
                              <FixedReadableDate dateString={entry["Date"]} />
                            </td>
                            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                              {entry["Student Number"]}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                              {entry["Term and Semester"]}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                              {entry["Category"]}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 whitespace-nowrap">
                              {entry["Remarks"] === "Complied with Format" ? (
                                <span className="text-green-600 font-semibold">
                                  Complied with Format ✅
                                </span>
                              ) : entry["Remarks"] === "Approved" ? (
                                <span className="text-green-600 font-semibold">
                                  Approved ✅
                                </span>
                              ) : entry["Remarks"] === "Resubmit" ? (
                                <span className="text-red-600 font-semibold">
                                  Resubmit ❌
                                </span>
                              ) : entry["Remarks"] === "Signed by the Dean" ? (
                                <span className="text-green-600 font-semibold">
                                  Signed by the Dean ✅
                                </span>
                              ) : (
                                <span className="text-yellow-600 font-semibold">
                                  In Progress ⏳
                                </span>
                              )}
                            </td>
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
                  If the status is Resubmit or Complied with Format. Kindly
                  pickup your manuscript at the office.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
