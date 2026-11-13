import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, X, ChevronDown, Smartphone, Check, Calculator } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shop/BottomNav";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTrade } from "@/lib/shop.functions";
import { getProfile, getToken, setProfile } from "@/lib/customer";
import { getCurrentUser, addTrade, addUserChatMessage, useAuth, openAuthModal } from "@/lib/auth";

export const Route = createFileRoute("/baholash")({
  head: () => ({
    meta: [
      { title: "Telefonni baholatish — PhoneHub" },
      { name: "description", content: "Telefoningizni 1 daqiqada baholating: model, xotira, batareya holatini tanlang va narx taklifini oling." },
      { property: "og:title", content: "Telefonni baholatish — PhoneHub" },
      { property: "og:description", content: "Ariza qoldiring va narx taklifini chatda oling." },
    ],
  }),
  component: TradeForm,
});

const MODELS: Record<string, string[]> = {
  Apple: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14", "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 12 Pro", "iPhone 12", "iPhone 11 Pro", "iPhone 11", "iPhone XR", "iPhone XS"],
  Samsung: ["Galaxy S24 Ultra", "Galaxy S23 Ultra", "Galaxy S23", "Galaxy S22 Ultra", "Galaxy S22", "Galaxy A55", "Galaxy A54", "Galaxy A34", "Galaxy Z Flip5", "Galaxy Z Fold5"],
  Xiaomi: ["Xiaomi 14", "Xiaomi 13T", "Redmi Note 13 Pro", "Redmi Note 12 Pro", "Redmi Note 12", "Poco X6 Pro", "Poco F5"],
};
const MEMORY = ["64 GB", "128 GB", "256 GB", "512 GB"];
const BATTERY = ["95–100%", "90–95%", "85–90%", "80–85%", "75–80%", "70–75%", "70% dan past", "Bilmayman"];

async function toWebp(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.8);
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${active ? "border-transparent bg-primary text-primary-foreground" : "bg-card"}`}>
      {children}
    </button>
  );
}

function TradeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [other, setOther] = useState("");
  const [memory, setMemory] = useState("");
  const [battery, setBattery] = useState("");
  const [defects, setDefects] = useState("");
  const [tech, setTech] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  useEffect(() => { setContact(getProfile()); }, []);

  const finalModel = brand === "Boshqa" ? other.trim() : model;
  const valid = finalModel.length >= 2 && memory && battery && contact.name.trim().length >= 2 && contact.phone.replace(/\D/g, "").length >= 7;

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    const arr = [...files].slice(0, 3 - images.length);
    for (const f of arr) {
      if (!f.type.startsWith("image/")) { toast.error("Faqat rasm yuklang"); continue; }
      if (f.size > 15 * 1024 * 1024) { toast.error("Rasm juda katta"); continue; }
      const w = await toWebp(f);
      setImages((s) => [...s, w].slice(0, 3));
    }
  };

  const submit = async () => {
    setTried(true);
    if (!valid) { toast.error("Majburiy maydonlarni to'ldiring"); return; }
    setBusy(true);
    try {
      setProfile(contact);
      const currentUser = getCurrentUser();
      const customerId = currentUser ? currentUser.id : "guest";
      addTrade({
        model: finalModel,
        memory,
        battery_range: battery,
        customer: {
          id: customerId,
          name: contact.name,
          phone: contact.phone,
        },
      });
      addUserChatMessage(
        customerId,
        "customer",
        `📱 Baholash arizasi: ${finalModel}, ${memory}, batareya ${battery}.\nIsm: ${contact.name}\nTel: ${contact.phone}\nNarx taklifini kutyapman.`
      );
      setTimeout(() => {
        addUserChatMessage(
          customerId,
          "shop",
          `Assalomu alaykum, ${contact.name}! ${finalModel} (${memory}) bo'yicha baholash arizangiz qabul qilindi. Mutaxassisimiz tez orada narx taklifini yuboradi! 🤝`
        );
      }, 1000);
      try {
        await createTrade({ data: { token: getToken(), model: finalModel, memory, battery, defects: defects || undefined, techState: tech || undefined, images, ...contact } });
      } catch (err) {
        console.warn("Server trade sync fallback", err);
      }
      toast.success("Ariza yuborildi!");
      navigate({ to: "/chat" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally { setBusy(false); }
  };

  const err = (bad: boolean) => (tried && bad ? <p className="mt-1 text-xs text-destructive">Majburiy maydon</p> : null);

  return (
    <div>
      <PageHeader title="Baholash" />
      <div className="space-y-6 px-4 pb-6">
        <section>
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Model *</Label>
            {finalModel && (
              <span className="text-xs text-primary font-semibold">
                Tanlandi: {finalModel}
              </span>
            )}
          </div>

          {/* Collapsed trigger / Selected model display */}
          <button
            type="button"
            onClick={() => setModelOpen(!modelOpen)}
            className="mt-2 flex w-full items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-left transition hover:border-primary/50 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {finalModel ? `${brand} modeli tanlangan` : "Telefon modelini tanlang"}
                </p>
                <p className="font-bold text-sm text-foreground">
                  {finalModel || "Modellar ro'yxatini ochish"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
              <span>{modelOpen ? "Yig'ish" : "Ochish"}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${modelOpen ? "rotate-180" : ""}`} />
            </div>
          </button>

          {/* Expandable models panel */}
          {modelOpen && (
            <div className="mt-3 rounded-2xl border border-border bg-card/60 p-4 shadow-sm space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Brendni tanlang:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[...Object.keys(MODELS), "Boshqa"].map((b) => (
                    <Pill
                      key={b}
                      active={brand === b}
                      onClick={() => {
                        setBrand(b);
                        setModel("");
                      }}
                    >
                      {b}
                    </Pill>
                  ))}
                </div>
              </div>

              {brand === "Boshqa" ? (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Model nomini yozing:</p>
                  <Input
                    className="h-11 rounded-xl"
                    placeholder="Masalan: Google Pixel 7 Pro"
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    maxLength={80}
                  />
                  <button
                    type="button"
                    onClick={() => setModelOpen(false)}
                    className="mt-2 w-full rounded-xl bg-secondary py-2 text-xs font-bold text-foreground"
                  >
                    Tayyor
                  </button>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground font-semibold">{brand} modellari (tanlash uchun bosing):</p>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {(MODELS[brand] ?? []).map((m) => {
                      const isSel = model === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setModel(m);
                            setModelOpen(false); // Collapses when selected
                          }}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-left text-xs font-medium transition ${
                            isSel
                              ? "border-primary bg-primary text-primary-foreground font-bold"
                              : "border-border bg-card hover:bg-secondary text-foreground"
                          }`}
                        >
                          <span className="truncate">{m}</span>
                          {isSel && <Check className="h-3.5 w-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {err(finalModel.length < 2)}
        </section>

        <section>
          <Label className="text-base font-semibold">Xotira *</Label>
          <div className="mt-2 grid grid-cols-4 gap-2">{MEMORY.map((m) => <Pill key={m} active={memory === m} onClick={() => setMemory(m)}>{m}</Pill>)}</div>
          {err(!memory)}
        </section>

        <section>
          <Label className="text-base font-semibold">Batareya holati *</Label>
          <div className="mt-2 grid grid-cols-4 gap-2">{BATTERY.map((m) => <Pill key={m} active={battery === m} onClick={() => setBattery(m)}>{m}</Pill>)}</div>
          {err(!battery)}
        </section>

        <section className="space-y-3">
          <div><Label>Tashqi nuqsonlar</Label><Textarea value={defects} onChange={(e) => setDefects(e.target.value)} placeholder="Tirnalish, siniq va h.k. (ixtiyoriy)" maxLength={1000} /></div>
          <div><Label>Texnik holati</Label><Textarea value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Kamera, Face ID / Touch ID ishlaydimi..." maxLength={1000} /></div>
        </section>

        <section>
          <Label className="text-base font-semibold">Rasmlar (3 tagacha)</Label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setImages((s) => s.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-card p-1" aria-label="O'chirish"><X className="h-3 w-3" /></button>
              </div>
            ))}
            {images.length < 3 && (
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-muted-foreground">
                <Camera className="h-6 w-6" /> {["Old", "Orqa", "Yon"][images.length]}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addImages(e.target.files)} />
              </label>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div><Label>Ism *</Label><Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} maxLength={80} />{err(contact.name.trim().length < 2)}</div>
          <div><Label>Telefon *</Label><Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+998 90 123 45 67" maxLength={30} />{err(contact.phone.replace(/\D/g, "").length < 7)}</div>
        </section>

        <button disabled={busy} onClick={submit} className="w-full rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Yuborilmoqda..." : "Arizani yuborish"}
        </button>
      </div>
    </div>
  );
}
