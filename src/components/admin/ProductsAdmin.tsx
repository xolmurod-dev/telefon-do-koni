import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProductArt } from "@/components/shop/ProductArt";
import { formatPrice } from "@/lib/customer";

type P = Tables<"products">;
const CAT = { phone: "Telefon", part: "Ehtiyot qism", accessory: "Aksessuar" } as const;
const SUBS: Record<string, string[]> = {
  part: ["Displey", "Akkumulyator", "Kamera", "Shleyf", "Korpus qismi"],
  accessory: ["Himoya oynasi", "G'ilof", "Zaryadlash bloki", "Kabel", "Quloqchin"],
};
const empty: Partial<P> = { category: "phone", name: "", brand: "", price: 0, status: "active", repaired: false, is_aksiya: false, images: [] };

async function toWebpBlob(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/webp", 0.82));
}

export function ProductsAdmin() {
  const [rows, setRows] = useState<P[]>([]);
  const [filter, setFilter] = useState<"active" | "sold">("active");
  const [edit, setEdit] = useState<Partial<P> | null>(null);
  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggleSold = async (p: P) => {
    await supabase.from("products").update({ status: p.status === "sold" ? "active" : "sold" }).eq("id", p.id);
    load();
  };
  const remove = async (p: P) => {
    if (!confirm(`"${p.name}" o'chirilsinmi?`)) return;
    await supabase.from("products").delete().eq("id", p.id);
    if (p.images.length) await supabase.storage.from("uploads").remove(p.images);
    load();
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">Mahsulotlar</h2>
        <button onClick={() => setEdit({ ...empty })} className="flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="h-4 w-4" /> Qo'shish</button>
      </div>
      <div className="mb-3 flex gap-2">
        {(["active", "sold"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "bg-primary text-primary-foreground" : ""}`}>{s === "active" ? "Faol" : "Sotilgan (arxiv)"}</button>
        ))}
      </div>
      <div className="space-y-2">
        {rows.filter((r) => r.status === filter).map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl"><ProductArt category={p.category} /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground">{CAT[p.category as keyof typeof CAT]} · {formatPrice(p.price)} · {p.images.length} rasm</p>
            </div>
            <button onClick={() => toggleSold(p)} className="rounded-full border px-3 py-1 text-xs">{p.status === "sold" ? "Faollash" : "Sotildi"}</button>
            <button onClick={() => setEdit(p)} aria-label="Tahrirlash" className="p-2"><Pencil className="h-4 w-4" /></button>
            <button onClick={() => remove(p)} aria-label="O'chirish" className="p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      {edit && <ProductForm initial={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </div>
  );
}

function ProductForm({ initial, onClose, onSaved }: { initial: Partial<P>; onClose: () => void; onSaved: () => void }) {
  const [p, setP] = useState<Partial<P>>(initial);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof P>(k: K, v: P[K] | null) => setP((s) => ({ ...s, [k]: v }));
  const isPhone = p.category === "phone";

  const upload = async (files: FileList | null) => {
    if (!files) return;
    const added: string[] = [];
    for (const f of [...files].slice(0, 8 - (p.images?.length ?? 0))) {
      if (!f.type.startsWith("image/")) continue;
      const blob = await toWebpBlob(f);
      if (blob.size > 5 * 1024 * 1024) { toast.error("Rasm 5 MB dan katta"); continue; }
      const path = `products/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage.from("uploads").upload(path, blob, { contentType: "image/webp" });
      if (error) toast.error("Rasm yuklanmadi"); else added.push(path);
    }
    setP((s) => ({ ...s, images: [...(s.images ?? []), ...added] }));
  };

  const save = async () => {
    if (!p.name?.trim()) { toast.error("Nomini kiriting"); return; }
    setBusy(true);
    const row = {
      category: p.category!, subcategory: p.subcategory || null, name: p.name.trim(), brand: p.brand?.trim() ?? "", price: Number(p.price) || 0,
      ram: p.ram || null, rom: p.rom || null, condition: p.condition || null, color: p.color || null,
      battery_health: p.battery_health ? Number(p.battery_health) : null, repaired: !!p.repaired, compatible_models: p.compatible_models || null,
      description: p.description || null, imei: p.imei || null, images: p.images ?? [], status: p.status ?? "active", is_aksiya: !!p.is_aksiya,
    };
    const { error } = p.id ? await supabase.from("products").update(row).eq("id", p.id) : await supabase.from("products").insert(row);
    setBusy(false);
    if (error) { toast.error("Saqlanmadi"); return; }
    toast.success("Saqlandi");
    onSaved();
  };

  const field = (label: string, k: keyof P, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><Label>{label}</Label><Input value={(p[k] as string | number | null) ?? ""} onChange={(e) => set(k, e.target.value as never)} {...props} /></div>
  );

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle>{p.id ? "Tahrirlash" : "Yangi mahsulot"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(CAT) as (keyof typeof CAT)[]).map((c) => (
              <button key={c} onClick={() => set("category", c)} className={`rounded-xl border py-2 text-sm ${p.category === c ? "bg-primary text-primary-foreground" : ""}`}>{CAT[c]}</button>
            ))}
          </div>
          {!isPhone && (
            <div className="flex flex-wrap gap-2">
              {SUBS[p.category!]?.map((s) => <button key={s} onClick={() => set("subcategory", s)} className={`rounded-full border px-3 py-1 text-xs ${p.subcategory === s ? "bg-primary text-primary-foreground" : ""}`}>{s}</button>)}
            </div>
          )}
          {field("Nomi", "name")}
          <div className="grid grid-cols-2 gap-2">{field("Brend", "brand")}{field("Narx (so'm)", "price", { inputMode: "numeric" })}</div>
          {isPhone ? (
            <>
              <div className="grid grid-cols-2 gap-2">{field("RAM (GB)", "ram")}{field("ROM (GB)", "rom")}</div>
              <div className="grid grid-cols-2 gap-2">{field("Rang", "color")}{field("Batareya %", "battery_health", { inputMode: "numeric" })}</div>
              {field("IMEI / seriya (ixtiyoriy)", "imei")}
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!p.repaired} onChange={(e) => set("repaired", e.target.checked)} /> Ta'mirlangan</label>
            </>
          ) : (
            field("Mos modellar", "compatible_models", { placeholder: "iPhone 11 / XR" })
          )}
          <div>
            <Label>Holat</Label>
            <div className="mt-1 flex gap-2">{["Ideal", "Yaxshi", "O'rta"].map((c) => <button key={c} onClick={() => set("condition", c)} className={`rounded-full border px-3 py-1 text-sm ${p.condition === c ? "bg-primary text-primary-foreground" : ""}`}>{c}</button>)}</div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-red-600"><input type="checkbox" checked={!!p.is_aksiya} onChange={(e) => set("is_aksiya", e.target.checked)} /> 🔥 Aksiya (chegirma) mahsulot</label>
          <div><Label>Tavsif</Label><Textarea value={p.description ?? ""} onChange={(e) => set("description", e.target.value)} /></div>
          <div>
            <Label>Rasmlar ({p.images?.length ?? 0}/8)</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {p.images?.map((img) => (
                <button key={img} onClick={() => set("images", (p.images ?? []).filter((x) => x !== img))} className="rounded-lg border px-2 py-1 text-xs">✕ {img.slice(-12)}</button>
              ))}
            </div>
            <input type="file" accept="image/*" multiple className="mt-2 text-sm" onChange={(e) => upload(e.target.files)} />
          </div>
          <button disabled={busy} onClick={save} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">{busy ? "Saqlanmoqda..." : "Saqlash"}</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
