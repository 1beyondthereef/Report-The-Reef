"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function ConnectNavBadge() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnread = async () => {
      try {
        const response = await fetch("/api/connect/conversations");
        if (response.ok) {
          const data = await response.json();
          const total = (data.conversations || []).reduce(
            (sum: number, c: { unreadCount: number }) => sum + c.unreadCount,
            0
          );
          setUnreadCount(total);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
