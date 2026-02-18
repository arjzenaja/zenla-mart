/**
 * Detect if current date is during Lebaran season
 * Lebaran typically occurs in Shawwal (Islamic month)
 * The function checks for Lebaran in May/early June as it typically falls around that time
 */

export const isLebaranSeason = () => {
  const today = new Date();
  const month = today.getMonth(); // 0-11
  const date = today.getDate();

  // Lebaran dates for various years (approximate Gregorian dates)
  // In Indonesia, Lebaran is celebrated for several days
  // Below are the approximate dates for recent and upcoming years
  const lebaranDates = [
    // 2024: April 10 - April 11
    { year: 2024, startMonth: 3, startDate: 10, endMonth: 3, endDate: 11 },
    // 2025: March 30 - March 31
    { year: 2025, startMonth: 2, startDate: 30, endMonth: 2, endDate: 31 },
    // 2026: May 16 - May 17 (approximately)
    { year: 2026, startMonth: 4, startDate: 15, endMonth: 4, endDate: 20 },
    // 2027: May 6 - May 7
    { year: 2027, startMonth: 4, startDate: 5, endMonth: 4, endDate: 10 },
  ];

  const currentYear = today.getFullYear();
  const currentLebaranPeriod = lebaranDates.find(d => d.year === currentYear);

  if (!currentLebaranPeriod) {
    // If year is not in predefined list, use a broader check for May
    // This is a fallback to detect Lebaran season (May is typical month)
    return month === 4; // May (0-indexed, so 4 = May)
  }

  // Check if current date falls within Lebaran period
  const startDate = new Date(currentYear, currentLebaranPeriod.startMonth, currentLebaranPeriod.startDate);
  const endDate = new Date(currentYear, currentLebaranPeriod.endMonth, currentLebaranPeriod.endDate);

  // Also check a few days before and after for extended celebration
  startDate.setDate(startDate.getDate() - 2);
  endDate.setDate(endDate.getDate() + 7);

  return today >= startDate && today <= endDate;
};

/**
 * Get Lebaran season info
 */
export const getLebaranInfo = () => {
  const today = new Date();
  const currentYear = today.getFullYear();

  const lebaranDates = {
    2024: { date: 'April 10-11', name: 'Lebaran 2024' },
    2025: { date: 'March 30-31', name: 'Lebaran 2025' },
    2026: { date: 'May 16-17', name: 'Lebaran 2026' },
    2027: { date: 'May 6-7', name: 'Lebaran 2027' },
  };

  return lebaranDates[currentYear] || { date: 'Coming soon', name: 'Lebaran' };
};
