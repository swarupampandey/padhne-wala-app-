import { useState, useEffect } from "react";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("zenith_user_id");
    if (stored) {
      setUserId(stored);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("zenith_user_id", newId);
      setUserId(newId);
    }
  }, []);

  return { userId };
}
