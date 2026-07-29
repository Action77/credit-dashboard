 libactivityLog.ts

import { supabase } from @libsupabase;

export async function addLog(
  username string,
  action string,
  details string
) {
  await supabase
    .from(activity_logs)
    .insert({
      username,
      action,
      details,
    });
}