"use client";

import { usePathname } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import UserWelcome from "@/components/UserWelcome";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#071d5c] to-[#0b2a7a] shadow-lg border-b border-blue-800">
      <div className="flex items-center justify-between px-6 py-3">
        <UserWelcome />

        <div className="flex items-center gap-3">
          {pathname.startsWith("/van") && (
            <button className="h-9 px-4 rounded-lg bg-blue-600 text-white">
              Login
            </button>
          )}

          <NotificationBell />
        </div>
      </div>
    </header>
  );
}