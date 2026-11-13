import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  BatteryMedium,
  Truck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ProductArt } from "@/components/shop/ProductArt";
import { formatPrice } from "@/lib/customer";
import {
  useAuth,
  addOrder,
  addUserChatMessage,
  ProductItem,
} from "@/lib/auth";

interface BookingModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ product, isOpen, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, [user, isOpen]);

  if (!product) return null;

  const isPhone = product.category === "phone";

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      toast.error("Iltimos, ismingizni kiriting");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 7) {
      toast.error("Iltimos, to'g'ri telefon raqam kiriting");
      return;
    }

    setBusy(true);
    try {
      // 1. Create order
      addOrder({
        product_name: product.name,
        price: product.price,
        product_id: product.id,
        customer: {
          id: user?.id || "guest_" + Date.now(),
          name: cleanName,
          phone: cleanPhone,
        },
      });

      // 2. Send message into chat
      const customerId = user ? user.id : "guest";
      addUserChatMessage(
        customerId,
        "customer",
        `🛒 ${product.name} — ${formatPrice(product.price)}\nMen ushbu ${isPhone ? "telefonni band qildim" : "mahsulotga buyurtma berdim"}.\nIsmim: ${cleanName}\nTelefon: ${cleanPhone}`
      );

      // Auto reply from shop in 1 second
      setTimeout(() => {
        addUserChatMessage(
          customerId,
          "shop",
          `Assalomu alaykum, ${cleanName}! ${product.name} uchun arizangiz qabul qilindi. Mahsulot siz uchun 24 soatga band qilindi. Mutaxassisimiz tez orada siz bilan bog'lanadi! 😊`
        );
      }, 1000);

      toast.success(`${product.name} muvaffaqiyatli band qilindi!`);
      onClose();
      navigate({ to: "/chat" });
    } catch (err: any) {
      toast.error(err?.message || "Band qilishda xatolik yuz berdi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                {isPhone ? "Telefonni band qilish" : "Mahsulotni buyurtma qilish"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Band qilish mutlaqo bepul. Mahsulot siz uchun 24 soatga saqlanadi.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Product Details Preview Card */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-border bg-secondary/40 p-3">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-card">
            <ProductArt category={product.category} src={product.cover} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-foreground">{product.name}</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.rom ? `${product.rom} GB · ` : ""}
              {product.condition || "Tekshirilgan"}
            </p>
            <p className="mt-1 text-base font-extrabold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>
        </div>

        {/* Guarantees / Badges */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl border border-border/60 bg-card p-2 text-[11px]">
            <ShieldCheck className="mx-auto h-4 w-4 text-emerald-500" />
            <span className="mt-1 block font-semibold text-foreground">3 oy kafolat</span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-2 text-[11px]">
            <BatteryMedium className="mx-auto h-4 w-4 text-primary" />
            <span className="mt-1 block font-semibold text-foreground">
              {product.battery_health ? `${product.battery_health}% Akb` : "100% Original"}
            </span>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-2 text-[11px]">
            <Truck className="mx-auto h-4 w-4 text-amber-500" />
            <span className="mt-1 block font-semibold text-foreground">2 soatda yetkazish</span>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="space-y-3 pt-1">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Ism va familiyangiz *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Sardor Aliyev"
                className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Telefon raqamingiz *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            <span>{busy ? "Band qilinmoqda..." : "Band qilish"}</span>
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </form>

        {/* View Details Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/mahsulot/$id", params: { id: product.id } });
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Batafsil xarakteristikalarni ko'rish</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
