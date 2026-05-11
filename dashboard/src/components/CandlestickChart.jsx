// import React, { memo, useMemo, useState } from 'react';

function CandlestickChart({
  candles = [],
  width = 920,
  height = 360,
  showGrid = true,
  showPriceLabels = true,
  className = '',
}) {
  const [hovered, setHovered] = useState(null);

  const padding = {
    top: 20,
    right: 64,
    bottom: 42,
    left: 20,
  };

  const chart = useMemo(() => {
    if (!candles.length) return null;

    const high = Math.max(...candles.map((c) => c.high));
    const low = Math.min(...candles.map((c) => c.low));

    const range = Math.max(high - low, 1);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const slotWidth = chartWidth / candles.length;

    const bodyWidth = Math.max(
      4,
      Math.min(18, slotWidth * 0.58)
    );

    const toY = (value) =>
      padding.top + ((high - value) / range) * chartHeight;

    const step = Math.max(1, Math.ceil(candles.length / 6));

    const labelIndexes = candles
      .map((_, i) => i)
      .filter((i) => i % step === 0 || i === candles.length - 1);

    const priceLevels = Array.from({ length: 5 }, (_, i) => {
      const value = high - (range / 4) * i;

      return {
        value,
        y: padding.top + (chartHeight / 4) * i,
      };
    });

    return {
      high,
      low,
      range,
      chartWidth,
      chartHeight,
      slotWidth,
      bodyWidth,
      toY,
      labelIndexes,
      priceLevels,
    };
  }, [candles, width, height]);

  if (!candles.length || !chart) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No candle data available
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 ${className}`}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Candlestick chart"
      >
        <title>Candlestick Chart</title>
        <desc>OHLC stock market candlestick visualization</desc>

        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#020617"
        />

        {/* Grid + Price Labels */}
        {showGrid &&
          chart.priceLevels.map((level, index) => (
            <g key={index}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={level.y}
                y2={level.y}
                stroke="rgba(148,163,184,0.14)"
                strokeWidth="1"
              />

              {showPriceLabels && (
                <text
                  x={width - padding.right + 8}
                  y={level.y + 4}
                  fontSize="11"
                  fill="#94A3B8"
                >
                  {level.value.toFixed(2)}
                </text>
              )}
            </g>
          ))}

        {/* Candles */}
        {candles.map((candle, index) => {
          const x =
            padding.left +
            chart.slotWidth * index +
            chart.slotWidth / 2;

          const openY = chart.toY(candle.open);
          const closeY = chart.toY(candle.close);
          const highY = chart.toY(candle.high);
          const lowY = chart.toY(candle.low);

          const bullish = candle.close >= candle.open;

          const color = bullish
            ? '#22C55E'
            : '#EF4444';

          const bodyTop = Math.min(openY, closeY);

          const bodyHeight = Math.max(
            Math.abs(openY - closeY),
            2
          );

          return (
            <g
              key={`${candle.time}-${index}`}
              onMouseEnter={() => setHovered({ candle, x })}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Wick */}
              <line
                x1={x}
                x2={x}
                y1={highY}
                y2={lowY}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
              />

              {/* Candle Body */}
              <rect
                x={x - chart.bodyWidth / 2}
                y={bodyTop}
                width={chart.bodyWidth}
                height={bodyHeight}
                rx="2"
                fill={
                  bullish
                    ? 'rgba(34,197,94,0.25)'
                    : 'rgba(239,68,68,0.25)'
                }
                stroke={color}
                strokeWidth="1.5"
              />
            </g>
          );
        })}

        {/* Time Labels */}
        {chart.labelIndexes.map((index) => {
          const x =
            padding.left +
            chart.slotWidth * index +
            chart.slotWidth / 2;

          return (
            <text
              key={index}
              x={x}
              y={height - 14}
              textAnchor="middle"
              fontSize="11"
              fill="#94A3B8"
            >
              {candles[index]?.label}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute pointer-events-none z-10 rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-2xl backdrop-blur"
          style={{
            left: hovered.x - 50,
            top: 12,
          }}
        >
          <div className="mb-1 font-semibold text-white">
            {hovered.candle.label}
          </div>

          <div className="space-y-1 text-slate-300">
            <div>Open: {hovered.candle.open}</div>
            <div>High: {hovered.candle.high}</div>
            <div>Low: {hovered.candle.low}</div>
            <div>Close: {hovered.candle.close}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CandlestickChart);