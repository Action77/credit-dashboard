// lib/activityLog.ts

import { supabase } from "@/lib/supabase";

export async function addLog(
  username: string,
  action: string,
  details: string
) {
  await supabase
    .from("activity_logs")
    .insert({
      username,
      action,
      details,
    });
}