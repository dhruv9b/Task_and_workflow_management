import { useState, useEffect } from "react";
import FullPageLoader from "./FullPageLoader.jsx";

export default function RouteLoader({ children, delay = 300 }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return <FullPageLoader text="Loading page..." />;
  }

  return <>{children}</>;
}
