function KPICard({ title, value, change, icon, tone = 'primary', onClick }) {
  const handleKeyDown = (event) => {
    if (!onClick) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`kpi-card ${onClick ? 'kpi-card-clickable' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`kpi-icon tone-${tone}`}>{icon}</div>
      <div className="kpi-copy">
        <span>{title}</span>
        <strong>{value}</strong>
        {change ? <small className={change.startsWith('-') ? 'text-danger' : 'text-success'}>{change}</small> : null}
      </div>
    </article>
  );
}

export default KPICard;
