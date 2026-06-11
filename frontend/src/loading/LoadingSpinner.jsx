export default function LoadingSpinner({ size = "md", text, variant = "default" }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  const variants = {
    default: "border-green-500 border-t-transparent",
    primary: "border-blue-500 border-t-transparent",
    secondary: "border-yellow-500 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`animate-spin rounded-full ${variants[variant]} ${sizes[size]}`}
      />
      {text && <span className="text-sm text-zinc-400 animate-pulse">{text}</span>}
    </div>
  );
}
