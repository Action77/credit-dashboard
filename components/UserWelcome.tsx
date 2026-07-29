"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UserWelcome() {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const username =
        localStorage.getItem("currentUser");

      if (!username) return;

      const { data } = await supabase
        .from("app_users")
        .select("full_name")
        .eq("username", username)
        .single();

      if (data?.full_name) {
        setFullName(data.full_name);
      }
    };

    loadUser();
  }, []);

  if (!fullName) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        {fullName.charAt(0).toUpperCase()}
      </div>

      <div>
        <p className="text-xs text-gray-500">
          Welcome Back
        </p>

        <p className="font-semibold text-slate-800">
          {fullName}
        </p>
      </div>
    </div>
  );
}