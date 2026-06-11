import LoadingSpinner from "./LoadingSpinner";

export default function LoadingButton({
  children,
  loading,
  disabled,
  onClick,
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}`}
    >
      {loading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
}
