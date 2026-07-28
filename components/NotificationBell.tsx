"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function NotificationBell() {

  const [open, setOpen] = useState(false);

  const [notifications, setNotifications] =
    useState<any[]>([]);

  const loadNotifications = async () => {

    const username =
      localStorage.getItem("currentUser");

    if (!username) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("username", username)
      .order("created_at", {
        ascending: false,
      });

    setNotifications(data || []);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount =
    notifications.filter(
      (n) => !n.is_read
    ).length;

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative"
      >

        <Bell size={22} />

        {unreadCount > 0 && (

          <span
            className="
              absolute
              -top-2
              -right-2
              bg-red-600
              text-white
              text-xs
              rounded-full
              w-5
              h-5
              flex
              items-center
              justify-center
            "
          >
            {unreadCount}
          </span>

        )}

      </button>

      {open && (

        <div
          className="
            absolute
            right-0
            top-8
            w-96
            bg-white
            border
            rounded-xl
            shadow-xl
            z-50
          "
        >

          <div className="p-4 border-b">
            <h3 className="font-bold">
              Notifications
            </h3>
          </div>

          <div className="max-h-80 overflow-auto">

            {notifications.length === 0 ? (

              <p className="p-4 text-gray-500">
                No notifications
              </p>

            ) : (

              notifications.map((n) => (

                <div
                  key={n.id}
                  className="
                    p-3
                    border-b
                    hover:bg-gray-50
                  "
                >
                  <div className="font-medium">
                    {n.title}
                  </div>

                  <div className="text-sm text-gray-500">
                    {n.message}
                  </div>
                </div>

              ))

            )}

          </div>

        </div>

      )}

    </div>
  );
}