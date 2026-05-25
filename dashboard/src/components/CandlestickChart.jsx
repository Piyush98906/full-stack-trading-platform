import React, { memo, useMemo, useState } from 'react';

function CandlestickChart({
  candles = [],
  sessionSlots = [],
  width = 920,
  height = 380,
  showGrid = true,
  showPriceLabels = true,
  className = '',
}) {
  const [hovered, setHovered] = useState(null);
  const safeSessionSlots = Array.isArray(sessionSlots) ? sessionSlots : [];

  const padding = {
    top: 24,
    right: 64,
    bottom: 32,
    left: 24,
  };

  const chart = useMemo(() => {
    const normalizedCandles = candles.filter(
      (candle) =>
        candle &&
        Number.isFinite(Number(candle.open)) &&
        Number.isFinite(Number(candle.high)) &&
        Number.isFinite(Number(candle.low)) &&
        Number.isFinite(Number(candle.close))
    ).map((candle) => ({
      ...candle,
      open: Number(candle.open),
      high: Number(candle.high),
      low: Number(candle.low),
      close: Number(candle.close),
      volume: Number(candle.volume || 0),
    }));

    if (!normalizedCandles.length) return null;

    const priceHigh = Math.max(...normalizedCandles.map((c) => c.high));
    const priceLow = Math.min(...normalizedCandles.map((c) => c.low));
    const priceRange = Math.max(priceHigh - priceLow, 1);
    const maxVolume = Math.max(...normalizedCandles.map((c) => Number(c.volume || 0)), 1);
    const chartWidth = width - padding.left - padding.right;
    const priceHeight = height - padding.top - padding.bottom - 76;
    const volumeTop = padding.top + priceHeight + 24;
    const volumeHeight = 52;
    const axisSlots = safeSessionSlots.length ? safeSessionSlots : normalizedCandles.map((candle) => candle.label);
    const totalSlots = Math.max(axisSlots.length, normalizedCandles.length, 1);
    const slotWidth = chartWidth / totalSlots;
    const bodyWidth = Math.max(4, Math.min(12, slotWidth * 0.58));
    const toY = (value) => padding.top + ((priceHigh - value) / priceRange) * priceHeight;
    const toVolumeHeight = (value) => (Number(value || 0) / maxVolume) * volumeHeight;
    const labelStep = Math.max(1, Math.ceil(axisSlots.length / 6));
    const labelIndexes = axisSlots
      .map((_, i) => i)
      .filter((i) => i % labelStep === 0 || i === axisSlots.length - 1);
    const priceLevels = Array.from({ length: 5 }, (_, i) => {
      const value = priceHigh - (priceRange / 4) * i;

      return {
        value,
        y: padding.top + (priceHeight / 4) * i,
      };
    });

    return {
      priceHigh,
      priceLow,
      chartWidth,
      priceHeight,
      volumeTop,
      volumeHeight,
      slotWidth,
      bodyWidth,
      toY,
      toVolumeHeight,
      labelIndexes,
      priceLevels,
      axisSlots,
      normalizedCandles,
    };
  }, [candles, safeSessionSlots, width, height]);

  if (!candles.length || !chart) {
    return (
      <div className="chart-shell">
        <div className="empty-state">No candle data available</div>
      </div>
    );
  }

  return (
    <div className={`chart-shell ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Candlestick chart with volume"
      >
        <title>Candlestick Chart</title>
        <desc>OHLC stock market candlestick visualization with volume bars and crosshair.</desc>

        <rect x="0" y="0" width={width} height={height} fill="#0A0D14" />

        {showGrid &&
          chart.priceLevels.map((level) => (
            <g key={level.value}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={level.y}
                y2={level.y}
                stroke="rgba(152,162,179,0.14)"
                strokeWidth="1"
              />
              {showPriceLabels && (
                <text x={width - padding.right + 8} y={level.y + 4} fontSize="11" fill="#98A2B3">
                  {level.value.toFixed(2)}
                </text>
              )}
            </g>
          ))}

        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={chart.volumeTop - 12}
          y2={chart.volumeTop - 12}
          stroke="rgba(152,162,179,0.18)"
          strokeWidth="1"
        />

        {chart.normalizedCandles.map((candle, index) => {
          const slotIndex = Number.isInteger(candle.slotIndex) ? candle.slotIndex : index;
          const x = padding.left + chart.slotWidth * slotIndex + chart.slotWidth / 2;
          const openY = chart.toY(candle.open);
          const closeY = chart.toY(candle.close);
          const highY = chart.toY(candle.high);
          const lowY = chart.toY(candle.low);
          const bullish = candle.close >= candle.open;
          const color = bullish ? '#12B76A' : '#F04438';
          const mutedColor = bullish ? 'rgba(18,183,106,0.34)' : 'rgba(240,68,56,0.34)';
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(openY - closeY), 2);
          const volumeHeight = chart.toVolumeHeight(candle.volume || 0);

          return (
            <g
              key={`${candle.time}-${index}`}
              onMouseEnter={() => setHovered({ candle, x, y: closeY })}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'crosshair' }}
            >
              <rect
                x={x - chart.bodyWidth / 2}
                y={chart.volumeTop + chart.volumeHeight - volumeHeight}
                width={chart.bodyWidth}
                height={Math.max(volumeHeight, 1)}
                rx="1"
                fill={mutedColor}
              />
              <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth="1.25" />
              <rect
                x={x - chart.bodyWidth / 2}
                y={bodyTop}
                width={chart.bodyWidth}
                height={bodyHeight}
                rx="2"
                fill={bullish ? 'rgba(18,183,106,0.24)' : 'rgba(240,68,56,0.24)'}
                stroke={color}
                strokeWidth="1.25"
              />
            </g>
          );
        })}

        {hovered && (
          <g pointerEvents="none">
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="rgba(238,241,247,0.34)"
              strokeDasharray="4 4"
            />
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={hovered.y}
              y2={hovered.y}
              stroke="rgba(238,241,247,0.24)"
              strokeDasharray="4 4"
            />
          </g>
        )}

        {chart.labelIndexes.map((index) => {
          const x = padding.left + chart.slotWidth * index + chart.slotWidth / 2;

          return (
            <text key={index} x={x} y={height - 12} textAnchor="middle" fontSize="11" fill="#697386">
              {chart.axisSlots[index]}
            </text>
          );
        })}
      </svg>

      {hovered && (
        <div
          className="chart-tooltip"
          style={{
            left: Math.min(Math.max(hovered.x + 12, 12), width - 180),
            top: 12,
          }}
        >
          <strong>{hovered.candle.label}</strong>
          <div>O {hovered.candle.open}</div>
          <div>H {hovered.candle.high}</div>
          <div>L {hovered.candle.low}</div>
          <div>C {hovered.candle.close}</div>
          <div>Vol {Number(hovered.candle.volume || 0).toLocaleString('en-IN')}</div>
        </div>
      )}
    </div>
  );
}

export default memo(CandlestickChart);
