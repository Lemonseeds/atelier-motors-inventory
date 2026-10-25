/**
 * Generates an iCalendar (.ics) format file blob for test drives and events.
 */
export function generateIcsCalendarFile({
  title,
  description = '',
  location = 'Atelier Motors Showroom',
  date, // 'YYYY-MM-DD'
  timeWindow = 'Morning',
}) {
  let startHour = 10;
  let durationHours = 2;
  if (timeWindow === 'Afternoon') startHour = 14;
  if (timeWindow === 'Evening') startHour = 17;

  const [year, month, day] = date.split('-').map(Number);
  const pad = (n) => String(n).padStart(2, '0');

  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(startHour)}0000Z`;
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(startHour + durationHours)}0000Z`;

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Atelier Motors//Test Drive Experience//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:test-drive-${Date.now()}@ateliermotors.com`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

/**
 * Triggers a browser download of an .ics calendar file.
 */
export function downloadIcsFile(calendarParams, filename = 'atelier-test-drive.ics') {
  const blob = generateIcsCalendarFile(calendarParams);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
