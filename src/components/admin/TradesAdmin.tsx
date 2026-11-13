import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { adminReply } from "@/lib/shop.functions";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/customer";

type Row = Tables<"trade_requests"> & { urls: string[] };
const LABEL: Record<string, string> = { pending: "Ko'rib chiqilmoqda", rated: "Baholandi", rejected: "Rad etildi" };

export function TradesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const load = async () => {
    const { data } = await supabase.from("trade_requests").select("*").order("created_at", { ascending: false });
    const out: Row[] = [];
    for (const r of data ?? []) {
      let urls: string[] = [];
      if (r.images.length) {
        const { data: s } = await supabase.storage.from("uploads").createSignedUrls(r.images, 3600);
        urls = (s ?? []).map((x) => x.signedUrl).filter(Boolean) as string[];
      }
      out.push({ ...r, urls });
    }
    setRows(out);
  };
  useEffect(() => {
    load();
    const ch = supabase.channel("trades-admin").on("postgres_changes", { event: "INSERT", schema: "public", table: "trade_requests" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div>
      <h2 className="mb-3 text-xl font-bold">Baholash arizalari</h2>
      {rows.length === 0 && <p className="text-muted-foreground">Hozircha ariza yo'q.</p>}
      <div className="space-y-3">{rows.map((r) => <TradeCard key={r.id} r={r} onDone={load} />)}</div>
    </div>
  );
}

function TradeCard({ r, onDone }: { r: Row; onDone: () => void }) {
  const [price, setPrice] = useState(r.offer_price?.toString() ?? "");
  const save = async (status: "rated" | "rejected") => {
    const offer = status === "rated" ? Number(price) : null;
    if (status === "rated" && !offer) { toast.error("Narxni kiriting"); return; }
    const { error } = await supabase.from("trade_requests").update({ status, offer_price: offer }).eq("id", r.id);
    if (error) { toast.error("Saqlanmadi"); return; }
    await adminReply({ data: { customerId: r.customer_id, text: status === "rated" ? `${r.model} uchun taklif narximiz: ${formatPrice(offer!)}` : `Afsuski, ${r.model} uchun arizangiz rad etildi.` } });
    toast.success("Saqlandi va mijozga yuborildi");
    onDone();
  };
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{r.model} · {r.memory}</p>
          <p className="text-sm text-muted-foreground">{r.name} · <a href={`tel:${r.phone}`} className="underline">{r.phone}</a></p>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{LABEL[r.status]}</span>
      </div>
      <dl className="mt-2 space-y-1 text-sm">
        <div><span className="text-muted-foreground">Batareya:</span> {r.battery_range}</div>
        {r.defects && <div><span className="text-muted-foreground">Nuqsonlar:</span> {r.defects}</div>}
        {r.tech_state && <div><span className="text-muted-foreground">Texnik holat:</span> {r.tech_state}</div>}
      </dl>
      {r.urls.length > 0 && (
        <div className="mt-3 flex gap-2">{r.urls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="h-20 w-20 rounded-xl object-cover" /></a>)}</div>
      )}
      <div className="mt-3 flex gap-2">
        <Input inputMode="numeric" placeholder="Taklif narxi (so'm)" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
        <button onClick={() => save("rated")} className="rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">Baholash</button>
        <button onClick={() => save("rejected")} className="rounded-full border px-4 text-sm">Rad</button>
      </div>
    </div>
  );
}
