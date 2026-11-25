import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Smartphone, Cpu, Headphones, Calculator, Tag } from "lucide-react";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { ProductArt } from "@/components/shop/ProductArt";
import { BookingModal } from "@/components/shop/BookingModal";
import { listProducts } from "@/lib/shop.functions";
import { formatPrice } from "@/lib/customer";
import { useAuth, openAuthModal, getAllProducts, ProductItem } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PhoneHub — ikkinchi qo'l telefonlar, ehtiyot qismlar, aksessuarlar" },
      { name: "description", content: "Tekshirilgan ikkinchi qo'l telefonlar, ehtiyot qismlar va aksessuarlar. Band qiling yoki telefoningizni baholating." },
      { property: "og:title", content: "PhoneHub — ikkinchi qo'l telefonlar" },
      { property: "og:description", content: "Tekshirilgan telefonlar, ehtiyot qismlar va aksessuarlar bir joyda." },
    ],
  }),
  component: Home,
});

const cats = [
  {
    cat: "phone",
    label: "Telefonlar",
    icon: Smartphone,
    note: "Tekshirilgan",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&auto=format&fit=crop&q=80",
  },
  {
    cat: "part",
    label: "Ehtiyot qismlar",
    icon: Cpu,
    note: "Displey, batareya",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=400&auto=format&fit=crop&q=80",
  },
  {
    cat: "accessory",
    label: "Aksessuarlar",
    icon: Headphones,
    note: "G'ilof, zaryadka",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80",
  },
  {
    cat: "aksiya",
    label: "Aksiya",
    icon: Tag,
    note: "🔥 Chegirmalar",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop&q=80",
  },
] as const;

const heroImages = [
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
] as const;

const heroSlides = [...heroImages, heroImages[0]];

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const { data: serverProducts } = useQuery({
    queryKey: ["products", "phone"],
    queryFn: () => listProducts({ data: { category: "phone" } }),
  });

  // Fallback to local synced products if server query is empty
  const displayProducts =
    serverProducts && serverProducts.length > 0
      ? serverProducts
      : getAllProducts().filter((p) => p.category === "phone");

  return (
    <div className="px-4 pt-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {user ? `Salom, ${user.name.split(" ")[0]} 👋` : "Salom 👋"}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">PhoneHub</h1>
        </div>
        <div className="flex items-center gap-2">
          {!user ? (
            <button
              onClick={() => openAuthModal("register", "Ilovadan to'liq foydalanish uchun ro'yxatdan o'ting")}
              className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Kirish
            </button>
          ) : (
            <Link
              to="/profil"
              className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-bold text-accent-foreground shadow-sm transition hover:opacity-90"
            >
              Profil
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Hero Banner with 1-by-1 Sliding Background Photos */}
      <div className="hero-banner relative mt-5 overflow-hidden rounded-3xl bg-neutral-900 p-5 text-white shadow-sm">
        {/* Background 1-by-1 Sliding Photos (Behind text) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
          <div className="flex h-full w-[400%] animate-hero-slider">
            {heroSlides.map((src, i) => (
              <div
                key={i}
                className="relative h-full w-1/4 shrink-0 overflow-hidden"
              >
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Soft dark shade on text side only - NO colored overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10">
          <p className="font-display text-2xl font-bold leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Telefoningizni<br />sotmoqchimisiz?
          </p>
          <p className="mt-2 text-sm text-white/90 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            1 daqiqada ariza qoldiring — narx taklifini chatda olasiz.
          </p>
          <button
            onClick={() => navigate({ to: "/baholash" })}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-md transition hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Calculator className="h-4 w-4" /> Baholatish
          </button>
        </div>
      </div>

      {/* Categories Horizontal Marquee */}
      <div className="marquee-container relative -mx-4 mt-5 overflow-hidden py-1">
        {/* Soft edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-background to-transparent" />

        <div className="flex w-max select-none">
          {[0, 1, 2].map((trackIdx) => (
            <div
              key={trackIdx}
              className="flex shrink-0 gap-3 pr-3 animate-marquee-left"
              aria-hidden={trackIdx > 0}
            >
              {cats.map(({ cat, label, icon: Icon, note, image }) => (
                <button
                  key={`${cat}-${trackIdx}`}
                  tabIndex={trackIdx > 0 ? -1 : 0}
                  onClick={() => navigate({ to: "/katalog", search: { cat } })}
                  className="group relative h-28 w-[160px] shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-card p-3.5 text-left shadow-sm transition hover:scale-[1.02] hover:shadow-md active:scale-95 cursor-pointer"
                >
                  {/* Clean Background Photo - NO colored overlays */}
                  <img
                    src={image}
                    alt={label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Soft bottom vignette only behind text so the photo stays 100% natural */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Card Content */}
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/25 bg-black/35 backdrop-blur-md text-white transition-transform duration-300 group-hover:scale-110 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate">
                        {label}
                      </p>
                      <p className="text-[11px] font-medium text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate">
                        {note}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* New Phones Section Title */}
      <div className="mt-7 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Yangi kelgan telefonlar</h2>
        <button
          onClick={() => navigate({ to: "/katalog", search: { cat: "phone" } })}
          className="flex items-center text-sm font-semibold text-primary hover:underline"
        >
          Barchasi <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Downward Phones Grid — Clicking anywhere on the card opens BookingModal */}
      <div className="mt-3 grid grid-cols-2 gap-3 pb-6">
        {displayProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelectedProduct(p as ProductItem)}
            className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition hover:border-primary/50 hover:shadow-md cursor-pointer active:scale-[0.98]"
            title="Band qilish uchun bosing"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-secondary/30">
              <ProductArt category={p.category} src={p.cover} />
              <div className="absolute bottom-2 right-2 rounded-xl bg-card/85 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur-sm shadow-xs">
                Band qilish
              </div>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {p.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {p.rom ? `${p.rom} GB · ` : ""}{p.condition || "Tekshirilgan"}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-sm font-bold text-primary">{formatPrice(p.price)}</p>
              </div>
            </div>
          </div>
        ))}
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
