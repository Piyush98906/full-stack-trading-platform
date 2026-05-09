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
    return `₹${(value / 1e7).toFixed(2)}Cr`;
  }

  if (value >= 1e5) {
    return `₹${(value / 1e5).toFixed(2)}L`;
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
  const palette = ['#4F46E5', '#0EA5E9', '#F97316', '#16A34A', '#DC2626', '#8B5CF6'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
};
