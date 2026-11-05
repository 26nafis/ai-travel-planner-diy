export default function Spinner({ className = '' }) {
  return (
    <span role="status" className={`inline-block h-6 w-6 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary ${className}`}>
      <span className="sr-only">Loading</span>
    </span>
  );
}
