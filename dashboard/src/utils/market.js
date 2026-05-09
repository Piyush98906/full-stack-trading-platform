export const formatDashboardDate = () =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

export const getMarketStatus = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short'
  }).formatToParts(new Date());

  const hour = Number(parts.find((item) => item.type === 'hour')?.value || 0);
  const minute = Number(parts.find((item) => item.type === 'minute')?.value || 0);
  const weekday = parts.find((item) => item.type === 'weekday')?.value || 'Mon';
  const minutes = hour * 60 + minute;
  const openMinutes = 9 * 60 + 15;
  const closeMinutes = 15 * 60 + 30;
  const isWeekday = !['Sat', 'Sun'].includes(weekday);
  const isOpen = isWeekday && minutes >= openMinutes && minutes <= closeMinutes;

  return {
    isOpen,
    label: isOpen ? 'Market Open' : 'Market Closed',
    hours: '9:15 AM - 3:30 PM IST'
  };
};

export const staticIndices = [
  { symbol: 'NIFTY 50', value: 22475.4, change: 0.68 },
  { symbol: 'SENSEX', value: 73985.12, change: 0.57 },
  { symbol: 'NIFTY BANK', value: 48210.8, change: 0.74 },
  { symbol: 'NIFTY IT', value: 36992.25, change: 1.1 },
  { symbol: 'NIFTY MIDCAP', value: 12152.34, change: 0.44 }
];
