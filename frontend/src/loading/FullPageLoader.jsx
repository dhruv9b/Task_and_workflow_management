import LoadingSpinner from "./LoadingSpinner";

export default function FullPageLoader({ text = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
