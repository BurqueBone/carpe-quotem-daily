"use client";

import { useState, useEffect } from "react";

const LIFE_MILESTONES = [
  { name: "Childhood", startMonth: 0, endMonth: 60, color: "hsl(280, 80%, 97%)" },
  { name: "Schooling", startMonth: 60, endMonth: 288, color: "hsl(210, 80%, 97%)" },
  { name: "Career Growth", startMonth: 288, endMonth: 600, color: "hsl(150, 80%, 97%)" },
  { name: "Career Peak", startMonth: 600, endMonth: 780, color: "hsl(45, 80%, 97%)" },
  { name: "Retirement", startMonth: 780, endMonth: 1080, color: "hsl(25, 80%, 97%)" },
];

const FOUR_K_WEEKS_MARKER = 960; // 80 years * 12 months

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const days = Array.from({ length: 31 }, (_, i) => i + 1);
const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);

function differenceInWeeks(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

export default function LifespanVisualizer() {
  const [selMonth, setSelMonth] = useState("");
  const [selDay, setSelDay] = useState("");
  const [selYear, setSelYear] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sunday4k_lifespan_dob");
    if (saved) {
      const d = new Date(saved);
      if (!isNaN(d.getTime())) {
        setBirthdate(d);
        setSelMonth(d.getMonth().toString());
        setSelDay(d.getDate().toString());
        setSelYear(d.getFullYear().toString());
      }
    }
  }, []);

  useEffect(() => {
    if (selDay && selMonth && selYear) {
      const d = new Date(parseInt(selYear), parseInt(selMonth), parseInt(selDay));
      if (!isNaN(d.getTime())) {
        setBirthdate(d);
        localStorage.setItem("sunday4k_lifespan_dob", d.toISOString().split("T")[0]);
      }
    }
  }, [selDay, selMonth, selYear]);

  const lifeData = birthdate ? calculateLife(birthdate) : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        Enter your birthday to visualize your life experienced so far.
      </p>

      {/* Date of Birth selectors */}
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-3">
          <select
            value={selMonth}
            onChange={(e) => setSelMonth(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          >
            <option value="">Month</option>
            {months.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selDay}
            onChange={(e) => setSelDay(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          >
            <option value="">Day</option>
            {days.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={selYear}
            onChange={(e) => setSelYear(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-navy"
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {birthdate && (
          <p className="mt-2 text-center text-sm text-gray-500">
            {months[birthdate.getMonth()]} {birthdate.getDate()}, {birthdate.getFullYear()}
          </p>
        )}
      </div>

      {/* Grid */}
      {!lifeData ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Enter your date of birth to visualize your life
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {LIFE_MILESTONES.map((milestone) => {
              const blocks = [];
              for (let i = milestone.startMonth; i < milestone.endMonth; i++) {
                const isCurrent = i === lifeData.currentMonthIndex;
                const isPast = i < lifeData.monthsLived;
                let cls = "border border-gray-200/60 bg-transparent"; // future: empty outline
                if (isPast) cls = "bg-brand-navy/50"; // lived: solid fill
                if (isCurrent) cls = "bg-brand-coral animate-pulse ring-2 ring-brand-coral/50"; // current: bright marker
                blocks.push(
                  <div
                    key={i}
                    className={`${cls} h-3.5 w-3.5 rounded-sm transition-transform hover:scale-125`}
                    title={`Month ${i}, Age ${Math.floor(i / 12)}${isPast ? ", Lived" : ""}`}
                  />
                );
              }

              return (
                <div
                  key={milestone.name}
                  className="rounded-lg border p-4"
                  style={{ backgroundColor: milestone.color }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-28 shrink-0 md:w-36">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {milestone.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {Math.floor(milestone.startMonth / 12)}-{Math.floor(milestone.endMonth / 12)} years
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1">
                        {blocks}
                      </div>
                    </div>
                  </div>
                  {milestone.startMonth <= FOUR_K_WEEKS_MARKER &&
                    milestone.endMonth > FOUR_K_WEEKS_MARKER && (
                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-brand-navy">
                        <div className="h-4 w-1 bg-brand-navy" />
                        <span>4K Weeks Milestone (80 years)</span>
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-navy">{lifeData.currentAge}</div>
              <div className="text-sm text-gray-500">Current Age</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{lifeData.monthsLived}</div>
              <div className="text-sm text-gray-500">Months Lived</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{lifeData.weeksLived}</div>
              <div className="text-sm text-gray-500">Weeks Lived</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-coral">{lifeData.weeksRemaining}</div>
              <div className="text-sm text-gray-500">Weeks Remaining</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function calculateLife(dob: Date) {
  const now = new Date();
  if (dob > now) return null;

  const ageInYears = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const currentAge = Math.floor(ageInYears);
  const monthsLived = Math.floor(ageInYears * 12);
  const weeksLived = differenceInWeeks(now, dob);
  const totalWeeks = 90 * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const currentMonthIndex = monthsLived;

  return { currentAge, monthsLived, weeksLived, weeksRemaining, currentMonthIndex };
}
