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
    <div className="fixed top-4 left-4 z-[9999] bg-white shadow-lg rounded-xl px-4 py-2">
      👋 Welcome, <b>{fullName}</b>
    </div>
  );
}