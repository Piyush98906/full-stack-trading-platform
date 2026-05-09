function LoadingSpinner({ label = 'Loading data...' }) {
  return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <p>{label}</p>
    </div>
  );
}

export default LoadingSpinner;
