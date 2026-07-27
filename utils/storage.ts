import { supabase } from "@/utils/supabase";

const TABLE = "storage";

export const storage = {
  async getItem(key: string) {
    const { data } = await supabase
      .from(TABLE)
      .select("value")
      .eq("key", key)
      .single();

    return data?.value ?? null;
  },

  async setItem(key: string, value: string) {
    await supabase
      .from(TABLE)
      .upsert({ key, value }, { onConflict: "key" });
  },

  async removeItem(key: string) {
    await supabase
      .from(TABLE)
      .delete()
      .eq("key", key);
  },
};