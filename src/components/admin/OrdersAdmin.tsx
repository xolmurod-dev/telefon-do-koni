import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { formatPrice } from "@/lib/customer";

export function OrdersAdmin() {
  const [rows, setRows] = useState<Tables<"orders">[]>([]);
  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => {
    load();
    const ch = supabase.channel("orders-admin").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  const setStatus = async (id: string, status: string) => { await supabase.from("orders").update({ status }).eq("id", id); load(); };
  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">Buyurtmalar</h2>
      {rows.length === 0 && <p className="text-muted-foreground">Hozircha buyurtma yo'q.</p>}
      <div className="space-y-2">
        {rows.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{o.product_name}</p>
                <p className="text-sm text-muted-foreground">{o.name} · <a href={`tel:${o.phone}`} className="underline">{o.phone}</a></p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ru-RU")}</p>
              </div>
              <p className="font-bold">{formatPrice(o.price)}</p>
            </div>
            <div className="mt-3 flex gap-2">
              {[["new", "Yangi"], ["done", "Bajarildi"], ["cancelled", "Bekor"]].map(([v, l]) => (
                <button key={v} onClick={() => setStatus(o.id, v!)} className={`rounded-full border px-3 py-1 text-xs ${o.status === v ? "bg-primary text-primary-foreground" : ""}`}>{l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
