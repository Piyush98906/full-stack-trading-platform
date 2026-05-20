export const formatINR = (num) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(num || 0));

export const formatCompact = (num) => {
  const value = Number(num || 0);

  if (value >= 1e7) {
    return `\u20B9${(value / 1e7).toFixed(2)}Cr`;
  }

  if (value >= 1e5) {
    return `\u20B9${(value / 1e5).toFixed(2)}L`;
  }

  return formatINR(value);
};

export const formatNumber = (num) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(Number(num || 0));

export const formatPercent = (num) => {
  const value = Number(num || 0);
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const getAvatarColor = (name = 'Trader') => {
  const palette = ['#F59E0B', '#38BDF8', '#F97316', '#22C55E', '#F87171', '#A78BFA'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};
