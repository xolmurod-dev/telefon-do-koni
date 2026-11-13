import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/shop/BottomNav";
import { ProductArt } from "@/components/shop/ProductArt";
import { listProducts } from "@/lib/shop.functions";
import { formatPrice } from "@/lib/customer";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BookingModal } from "@/components/shop/BookingModal";
import { useAuth, openAuthModal, getAllProducts, ProductItem } from "@/lib/auth";

const searchSchema = z.object({ cat: z.enum(["phone", "part", "accessory", "aksiya"]).catch("phone").default("phone") });

export const Route = createFileRoute("/katalog")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Katalog — PhoneHub" },
      { name: "description", content: "Telefonlar, ehtiyot qismlar va aksessuarlar katalogi: brend, holat, xotira va narx bo'yicha filtr." },
      { property: "og:title", content: "Katalog — PhoneHub" },
      { property: "og:description", content: "Ikkinchi qo'l telefonlar, ehtiyot qismlar va aksessuarlar katalogi." },
    ],
  }),
  component: Catalog,
});

const labels = { phone: "Telefonlar", part: "Ehtiyot qismlar", accessory: "Aksessuarlar", aksiya: "🔥 Aksiya" } as const;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm ${active ? "border-transparent bg-primary text-primary-foreground" : "bg-card"}`}>
      {children}
    </button>
  );
}

function Catalog() {
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const { cat } = Route.useSearch();
  const navigate = Route.useNavigate();
  const isAksiya = cat === "aksiya";
  const { data: serverData = [], isLoading } = useQuery({
    queryKey: ["products", cat],
    queryFn: () => isAksiya
      ? listProducts({ data: { aksiya: true } })
      : listProducts({ data: { category: cat } }),
  });
  const data = serverData.length > 0
    ? serverData
    : isAksiya
      ? getAllProducts().filter((p) => (p as any).is_aksiya === true)
      : getAllProducts().filter((p) => p.category === cat);
  const [q, setQ] = useState("");
  const [f, setF] = useState<{ brand?: string; condition?: string; rom?: string; color?: string; sub?: string; min?: string; max?: string }>({});

  const uniq = (k: keyof (typeof data)[number]) => [...new Set(data.map((p) => p[k]).filter(Boolean) as string[])];
  const list = useMemo(
    () =>
      data.filter((p) => {
        const text = `${p.name} ${p.brand} ${p.compatible_models ?? ""}`.toLowerCase();
        if (q && !text.includes(q.toLowerCase())) return false;
        if (f.brand && p.brand !== f.brand) return false;
        if (f.condition && p.condition !== f.condition) return false;
        if (f.rom && p.rom !== f.rom) return false;
        if (f.color && p.color !== f.color) return false;
        if (f.sub && p.subcategory !== f.sub) return false;
        if (f.min && p.price < Number(f.min)) return false;
        if (f.max && p.price > Number(f.max)) return false;
        return true;
      }),
    [data, q, f],
  );
  const toggle = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: s[k] === v ? undefined : v }));
  const activeCount = Object.values(f).filter(Boolean).length;

  return (
    <div>
      <PageHeader title="Katalog" />
      <div className="px-4">
        <div className="grid grid-cols-4 rounded-full bg-secondary p-1">
          {(Object.keys(labels) as (keyof typeof labels)[]).map((c) => (
            <button key={c} onClick={() => { setF({}); navigate({ search: { cat: c } }); }}
              className={`rounded-full py-2 text-xs font-semibold transition ${cat === c ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
              {labels[c]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidirish..." className="h-11 rounded-full pl-9" />
          </div>
          <Sheet>
            <SheetTrigger className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Filtrlar">
              <SlidersHorizontal className="h-5 w-5" />
              {activeCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">{activeCount}</span>}
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-5">
              <SheetHeader><SheetTitle>Filtrlar</SheetTitle></SheetHeader>
              <div className="space-y-5 px-1 pb-8 pt-4">
                {cat !== "phone" && cat !== "aksiya" && uniq("subcategory").length > 0 && (
                  <Group title="Turi">{uniq("subcategory").map((v) => <Chip key={v} active={f.sub === v} onClick={() => toggle("sub", v)}>{v}</Chip>)}</Group>
                )}
                <Group title="Brend">{uniq("brand").map((v) => <Chip key={v} active={f.brand === v} onClick={() => toggle("brand", v)}>{v}</Chip>)}</Group>
                {(cat === "phone" || (cat === "aksiya" && data.some((p: any) => p.category === "phone"))) && (
                  <>
                    <Group title="Holat">{["Ideal", "Yaxshi", "O'rta"].map((v) => <Chip key={v} active={f.condition === v} onClick={() => toggle("condition", v)}>{v}</Chip>)}</Group>
                    <Group title="Xotira (ROM)">{uniq("rom").map((v) => <Chip key={v} active={f.rom === v} onClick={() => toggle("rom", v)}>{v} GB</Chip>)}</Group>
                    <Group title="Rang">{uniq("color").map((v) => <Chip key={v} active={f.color === v} onClick={() => toggle("color", v)}>{v}</Chip>)}</Group>
                  </>
                )}
                <Group title="Narx (so'm)">
                  <div className="grid w-full grid-cols-2 gap-2">
                    <Input inputMode="numeric" placeholder="dan" value={f.min ?? ""} onChange={(e) => setF((s) => ({ ...s, min: e.target.value.replace(/\D/g, "") }))} />
                    <Input inputMode="numeric" placeholder="gacha" value={f.max ?? ""} onChange={(e) => setF((s) => ({ ...s, max: e.target.value.replace(/\D/g, "") }))} />
                  </div>
                </Group>
                <button onClick={() => setF({})} className="w-full rounded-full border py-3 text-sm font-semibold">Tozalash</button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {isLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />)}
          {list.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProduct(p as ProductItem)}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.98]"
              title="Band qilish uchun bosing"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-secondary/30">
                <ProductArt category={p.category} src={p.cover} />
                {(p as any).is_aksiya && (
                  <div className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    🔥 Aksiya
                  </div>
                )}
                <div className="absolute bottom-2 right-2 rounded-xl bg-card/85 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm shadow-xs">
                  Band qilish
                </div>
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {p.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.category === "phone" ? `${p.ram ?? "?"}/${p.rom ?? "?"} GB · ${p.condition ?? ""}` : p.compatible_models ?? p.subcategory}
                </p>
                <p className="mt-1.5 text-sm font-bold text-primary">{formatPrice(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && list.length === 0 && <p className="py-16 text-center text-muted-foreground">Hech narsa topilmadi</p>}
      </div>

      {/* Quick Booking Modal */}
      <BookingModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
