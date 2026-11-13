import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, BatteryMedium, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";
import { getProduct, createOrder } from "@/lib/shop.functions";
import { ProductArt } from "@/components/shop/ProductArt";
import { formatPrice, getProfile, getToken, setProfile } from "@/lib/customer";
import { getCurrentUser, addOrder, addUserChatMessage, useAuth, openAuthModal, getAllProducts } from "@/lib/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function fetchProductData(id: string) {
  try {
    const serverP = await getProduct({ data: { id } });
    if (serverP) return serverP;
  } catch {
    // Fallback below
  }
  const local = getAllProducts().find((p) => p.id === id);
  if (local) {
    const imgs = local.images && local.images.length > 0 ? local.images : local.cover ? [local.cover] : [];
    return {
      ...local,
      imei: null,
      description: null,
      imageUrls: imgs,
    };
  }
  return null;
}

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => fetchProductData(id),
  });

export const Route = createFileRoute("/mahsulot/$id")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!p) throw notFound();
    return { name: p.name, price: p.price };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Mahsulot topilmadi — PhoneHub" }, { name: "robots", content: "noindex" }] };
    const t = `${loaderData.name} — ${formatPrice(loaderData.price)} | PhoneHub`;
    const d = `${loaderData.name} PhoneHub do'konida. Band qiling yoki chatda savol bering.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-lg font-semibold">Mahsulot topilmadi yoki sotilgan</p>
      <Link to="/katalog" search={{ cat: "phone" }} className="mt-4 inline-block underline">Katalogga qaytish</Link>
    </div>
  ),
  errorComponent: () => <div className="p-8 text-center">Yuklashda xatolik. Qayta urinib ko'ring.</div>,
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const { data: p } = useSuspenseQuery(productQuery(id));
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [img, setImg] = useState(0);

  if (!p) return null;
  const isPhone = p.category === "phone";
  const rawImages = (p as any).imageUrls || (p as any).images || [];
  const imageUrls: string[] = rawImages.length > 0 ? rawImages : (p as any).cover ? [(p as any).cover] : [];

  const openForm = () => {
    setForm(getProfile());
    setOpen(true);
  };

  const submit = async () => {
    if (form.name.trim().length < 2 || form.phone.replace(/\D/g, "").length < 7) {
      toast.error("Ism va telefon raqamni kiriting");
      return;
    }
    setBusy(true);
    try {
      setProfile(form);
      const currentUser = getCurrentUser();
      const customerId = currentUser ? currentUser.id : "guest";
      addOrder({
        product_name: p.name,
        price: p.price,
        product_id: p.id,
        category: p.category as any,
        customer: {
          id: customerId,
          name: form.name,
          phone: form.phone,
        },
      });
      const verb = isPhone ? "band qilmoqchiman" : "buyurtma bermoqchiman";
      addUserChatMessage(
        customerId,
        "customer",
        `🛒 ${p.name} — ${formatPrice(p.price)}\nMen ushbu mahsulotni ${verb}.\nIsm: ${form.name}\nTel: ${form.phone}`
      );
      setTimeout(() => {
        addUserChatMessage(
          customerId,
          "shop",
          `Assalomu alaykum, ${form.name}! ${p.name} uchun arizangiz qabul qilindi. Mahsulot siz uchun 24 soatga saqlanadi. Mutaxassisimiz tez orada bog'lanadi! 😊`
        );
      }, 1000);
      try {
        await createOrder({ data: { token: getToken(), productId: p.id, ...form } });
      } catch (err) {
        console.warn("Server order sync fallback", err);
      }
      setOpen(false);
      toast.success("Ariza qabul qilindi va chatga yuborildi");
      navigate({ to: "/chat" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  };

  const specs: [string, string | null | undefined][] = isPhone
    ? [["Brend", p.brand], ["Xotira", `${p.ram ?? "?"} / ${p.rom ?? "?"} GB`], ["Holat", p.condition], ["Rang", p.color], ["IMEI", (p as any).imei]]
    : [["Brend", p.brand], ["Turi", (p as any).subcategory], ["Mos modellar", (p as any).compatible_models], ["Holat", p.condition]];

  return (
    <div className="pb-24">
      <div className="relative aspect-square">
        <ProductArt category={p.category} src={imageUrls[img] ?? (p as any).cover ?? null} />
        <button onClick={() => window.history.back()} aria-label="Orqaga" className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow"><ChevronLeft /></button>
        {imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {imageUrls.map((_, i) => <button key={i} onClick={() => setImg(i)} className={`h-2 rounded-full ${i === img ? "w-5 bg-accent" : "w-2 bg-card/80"}`} aria-label={`Rasm ${i + 1}`} />)}
          </div>
        )}
      </div>
      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="mt-1 font-display text-2xl font-extrabold">{formatPrice(p.price)}</p>
        {isPhone && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-secondary p-3"><BatteryMedium className="h-5 w-5" /><div><p className="text-xs text-muted-foreground">Batareya</p><p className="font-semibold">{p.battery_health ?? "?"}%</p></div></div>
            <div className="flex items-center gap-2 rounded-2xl bg-secondary p-3">{p.repaired ? <Wrench className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}<div><p className="text-xs text-muted-foreground">Ta'mir</p><p className="font-semibold">{p.repaired ? "Ta'mirlangan" : "Ta'mirlanmagan"}</p></div></div>
          </div>
        )}
        <dl className="mt-4 divide-y rounded-2xl border bg-card">
          {specs.filter(([, v]) => v).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
          ))}
        </dl>
        {(p as any).description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{(p as any).description}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto max-w-lg px-4">
        <button onClick={openForm} className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground shadow-lg">
          {isPhone ? "Band qilish" : "Buyurtma berish"}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader><DialogTitle>{isPhone ? "Band qilish" : "Buyurtma"}: {p.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Ism</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} /></div>
            <div><Label>Telefon</Label><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+998 90 123 45 67" maxLength={30} /></div>
            <button disabled={busy} onClick={submit} className="w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-60">
              {busy ? "Yuborilmoqda..." : "Chatga yuborish"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
