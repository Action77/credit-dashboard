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

  const saudiNow = new Date(
    new Date().toLocaleString(
      "en-US",
      {
        timeZone: "Asia/Riyadh",
      }
    )
  );

  const saudiTodayStart =
    new Date(
      saudiNow.getFullYear(),
      saudiNow.getMonth(),
      saudiNow.getDate(),
      0,
      0,
      0,
      0
    );

  await supabase
    .from("notifications")
    .delete()
    .lt(
      "created_at",
      saudiTodayStart.toISOString()
    );

  const { data } = await supabase
  .from("notifications")
  .select("*")
  .or(
    `username.eq.${username},username.is.null`
  )
  .order("created_at", {
    ascending: false,
  });

const { data: settings } = await supabase
  .from("user_settings")
  .select("*")
  .eq("username", username)
  .single();

let filtered = data || [];

if (settings) {

  filtered = filtered.filter((n) => {

  if (
  n.title.toLowerCase().includes("credit")
) {

  if (
    settings.credit_disabled_at &&
    new Date(n.created_at) <=
      new Date(
        settings.credit_disabled_at
      )
  ) {
    return false;
  }

}

if (
  n.title.toLowerCase().includes("collection")
) {

  if (
    settings.collection_disabled_at &&
    new Date(n.created_at) <=
      new Date(
        settings.collection_disabled_at
      )
  ) {
    return false;
  }

}

if (
  n.title.toLowerCase().includes("disappeared")
) {

  if (
    settings.disappeared_disabled_at &&
    new Date(n.created_at) <=
      new Date(
        settings.disappeared_disabled_at
      )
  ) {
    return false;
  }

}

if (
  n.title.toLowerCase().includes("exception")
) {

  if (
    settings.exception_disabled_at &&
    new Date(n.created_at) <=
      new Date(
        settings.exception_disabled_at
      )
  ) {
    return false;
  }

}

    return true;

  });

}

setNotifications(filtered);
};

useEffect(() => {

  loadNotifications();

  const interval =
    setInterval(
      loadNotifications,
      5000
    );

  return () =>
    clearInterval(interval);

}, []);

  const unreadCount =
    notifications.filter(
      (n) => !n.is_read
    ).length;

  return (
    <div className="relative">

<button
  onClick={async () => {

    const nextState = !open;

    setOpen(nextState);

    if (nextState) {

      const username =
        localStorage.getItem(
          "currentUser"
        );

      if (username) {

        await supabase
          .from("notifications")
          .update({
            is_read: true,
          })
          .or(
            `username.eq.${username},username.is.null`
          );

        loadNotifications();

      }

    }

  }}
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
    w-[420px]
    bg-white
    border
    rounded-xl
    shadow-xl
    z-50
  "
>
          <div className="p-4 border-b">
            <h3 className="font-bold">
  Notifications ({notifications.length})
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
  className={`p-4 border-b transition ${
    !n.is_read
      ? "bg-blue-50"
      : "hover:bg-slate-50"
  }`}
>
  <div className="font-semibold text-slate-800">
    {n.title}
  </div>

  <div className="text-sm text-slate-500 mt-1">
    {n.message}
  </div>

  <div className="text-xs text-slate-400 mt-2">
    {new Date(n.created_at).toLocaleString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    )}
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