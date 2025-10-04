/**
 * @file Home.tsx
 * @description
 * Main page component for the investor email prediction UI.
 * 
 * Renders three input controls:
 *  - Investor Name: simple text field
 *  - Firm: type-ahead autocomplete with validation
 *  - Domain: conditional dropdown (readonly for single domain, selectable for multi-domain firms)
 * 
 * Handles all form logic client-side using React state.
 * 
 * Later stages:
 *  - Firm/domain lists will be fetched from a backend API or database.
 *  - Validation will run against live data instead of hardcoded arrays.
 * 
 * @module Home
 * @returns {JSX.Element} Fully rendered page component
 * 
 * @example
 * // Example usage (Next.js automatically renders this as the index page)
 * export default function Home() {
 *   return <Home />;
 * }
 */

"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  // React state variables
  // ----------------------------
  const [investor, setInvestor] = useState("");               // Investor name input
  const [firm, setFirm] = useState("");                       // Firm name input (autocomplete)
  const [domain, setDomain] = useState("");                   // Selected domain for that firm
  const [showDropdown, setShowDropdown] = useState(false);    // Controls firm autocomplete dropdown visibility
  const [showDomainDropdown, setShowDomainDropdown] = useState(false); // Controls domain dropdown visibility

  // Demo firm + domain data
  // (in production this will come from a database or API)
  // ----------------------------
  const firms = [
    "Blackstone",
    "Sequoia Capital",
    "Andreessen Horowitz",
    "test2",
    "test3",
    "test4",
  ];

  const domains: Record<string, string[]> = {
    Blackstone: ["blackstone.com"],
    "Sequoia Capital": ["sequoiacap.com", "sequoia.com"],
    "Andreessen Horowitz": ["a16z.com"],
    test2: ["test2.com"],
    test3: ["test3.com"],
    test4: ["test4.com"],
  };

  // Filter firm list based on user input (case-insensitive)
  // Only runs client-side, lightweight
  // ----------------------------
  const filteredFirms = firms.filter((f) =>
    f.toLowerCase().includes(firm.toLowerCase())
  );

  // Handles firm selection from dropdown
  // - Sets firm name and default domain
  // - Clears transient filter state
  // - Hides firm dropdown
  // ----------------------------
  const handleFirmSelect = (f: string) => {
    setFirm(f);
    setDomain(domains[f]?.[0] ?? ""); // pick first domain automatically

    // Reset filtered firms list (forces dropdown to disappear cleanly)
    setTimeout(() => {
      setFirm("");
      setFirm(f); // reapply the chosen firm
    }, 0);

    setShowDropdown(false); // close firm dropdown
  };

  // Main JSX layout
  // ----------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-sans">
      {/* Logo at top */}
      <Image
        src="/next.svg"
        alt="Next.js logo"
        width={160}
        height={34}
        className="mb-8 dark:invert"
      />

      {/* Main content area (input controls) */}
      <div className="flex flex-col gap-6 w-full max-w-sm">

        {/* Investor Name Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Investor Name</label>
          <input
            type="text"
            value={investor}
            onChange={(e) => setInvestor(e.target.value)}
            placeholder="e.g. John Smith"
            className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-400"
          />
        </div>

        {/* Firm Name Autocomplete */}
        <div className="relative w-full max-w-sm">
          <label className="block text-sm font-medium mb-1">Firm</label>

          <input
            type="text"
            value={firm}
            onChange={(e) => {
              setFirm(e.target.value);  // update input text
              setShowDropdown(true);    // show suggestion list
            }}
            onFocus={() => setShowDropdown(true)} // show dropdown when input gains focus
            onBlur={() => {
              // Validate input when leaving field
              const normalized = firm.trim().toLowerCase();
              const isValid = firms.some((f) => f.toLowerCase() === normalized);
              if (!isValid) {
                // Reset invalid firm names
                setFirm("");
                setDomain("");
              }
              setShowDropdown(false); // always close dropdown on blur
            }}
            placeholder="Start typing firm name..."
            className="w-full px-3 py-2 border rounded-lg"
          />

          {/* Dropdown with filtered firm matches */}
          {showDropdown && filteredFirms.length > 0 && (
            <ul
              className="
                absolute left-0 right-0 top-full z-10
                border rounded-lg mt-1 bg-white shadow
                max-h-40 overflow-auto
              "
            >
              {filteredFirms.map((f) => (
                <li
                  key={f}
                  onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                  onClick={() => handleFirmSelect(f)}    // handle firm click
                  className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                >
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Domain Dropdown  */}
        <div className="relative w-full max-w-sm">
          <label className="block text-sm font-medium mb-1">Domain</label>

          {firm && domains[firm] ? (
            // If firm has multiple domains -> show dropdown
            domains[firm].length > 1 ? (
              <>
                {/* Active domain display (click to open dropdown) */}
                <div
                  className="w-full px-3 py-2 border rounded-lg bg-white cursor-pointer"
                  onClick={() => setShowDomainDropdown((prev) => !prev)}
                >
                  {domain || domains[firm][0]}
                </div>

                {/* Domain dropdown list */}
                {showDomainDropdown && (
                  <ul
                    className="absolute left-0 right-0 top-full z-10 border rounded-lg mt-1 bg-white shadow max-h-40 overflow-auto"
                  >
                    {domains[firm].map((d) => (
                      <li
                        key={d}
                        onMouseDown={(e) => e.preventDefault()} // prevent premature blur
                        onClick={() => {
                          setDomain(d);                 // set selected domain
                          setShowDomainDropdown(false); // close dropdown
                        }}
                        className="px-3 py-1 hover:bg-gray-100 cursor-pointer"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              // If only one domain -> show greyed-out readonly input
              <input
                type="text"
                value={domains[firm][0]}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            )
          ) : (
            // If no firm selected -> show placeholder
            <input
              type="text"
              value=""
              readOnly
              placeholder="Select a firm first"
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          )}
        </div>
      </div>
    </div>
  );
}
