"use client";

import Link from "next/link";
import { SmartphoneCharging, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { storage as localStorage } from "@/utils/storage";
import NotificationBell from "@/components/NotificationBell";
import UserWelcome from "@/components/UserWelcome";

export default function Header() {
  const pathname = usePathname();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const user = await localStorage.getItem("currentUser");
      setIsLoggedIn(!!user);
    };

    loadUser();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 to-blue-500">
          
          <div className="flex items-center gap-3">
            <UserWelcome />
          </div>

          <div className="flex items-center gap-3">
            {/* Filter button - hidden on /van */}
            {!pathname.startsWith("/van") && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new Event("toggle-filters"));
                }}
                title="Filters"
                aria-label="Filters"
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  w-11
                  h-11
                  rounded-xl
                  bg-white/10
                  hover:bg-white/20
                  text-white
                  transition-all
                  duration-200
                "
              >
                <Filter size={22} />
              </button>
            )}

            <NotificationBell />
          </div>
        </div>
      </header>

      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl w-80">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-3 rounded-lg mb-3"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg mb-3"
            />

            <button
              type="button"
              className="w-full bg-blue-600 text-white py-3 rounded-lg"
              onClick={async () => {
                const { data: user, error } = await supabase
                  .from("app_users")
                  .select("*")
                  .eq("username", username)
                  .single();

                if (error || !user) {
                  alert("Invalid Username");
                  return;
                }

                if (user.password !== password) {
                  alert("Invalid Password");
                  return;
                }

                await localStorage.setItem(
                  "currentUser",
                  user.username
                );

                setIsLoggedIn(true);
                setShowLoginModal(false);

                window.location.reload();
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}