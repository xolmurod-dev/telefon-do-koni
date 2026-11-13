import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  User as UserIcon,
  Phone,
  MapPin,
  Package,
  Calculator,
  CheckCircle2,
  Clock,
  Truck,
  Edit3,
  MessageCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shop/BottomNav";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAuth,
  getUserOrders,
  getUserTrades,
  loginAsRole,
  OrderItem,
  TradeItem,
} from "@/lib/auth";
import { formatPrice } from "@/lib/customer";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — PhoneHub" },
      { name: "description", content: "Mening hisobim, buyurtmalarim va baholash arizalarim." },
      { property: "og:title", content: "Profil — PhoneHub" },
      { property: "og:description", content: "Buyurtmalar va arizalar tarixi." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, login, register, logout, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If unregistered, show Registration and Login in profile
  if (!user) {
    return <UnregisteredProfileView />;
  }

  return (
    <RegisteredProfileView
      user={user}
      isAdmin={isAdmin}
      onUpdate={updateProfile}
      onLogout={logout}
    />
  );
}

/* =========================================================================
   1. UNREGISTERED PROFILE VIEW (Profilda ro'yxatdan o'tish ko'rinishi)
   ========================================================================= */
function UnregisteredProfileView() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+998 ");
  const [regCity, setRegCity] = useState("Toshkent shahri");
  const [regPassword, setRegPassword] = useState("");

  // Login state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = register({
        name: regName,
        phone: regPhone,
        city: regCity,
        password: regPassword || "123456",
      });
      if (res.success && res.user) {
        toast.success(`Muvaffaqiyatli ro'yxatdan o'tdingiz, ${res.user.name}!`);
      } else {
        toast.error(res.error || "Ro'yxatdan o'tishda xatolik");
      }
    } catch (err: any) {
      toast.error(err?.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = login(loginPhone, loginPassword);
      if (res.success && res.user) {
        toast.success(`Xush kelibsiz, ${res.user.name}!`);
        if (res.user.role === "admin") {
          navigate({ to: "/admin" });
        }
      } else {
        toast.error(res.error || "Login yoki parol noto'g'ri");
      }
    } catch (err: any) {
      toast.error(err?.message || "Tizimga kirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = (role: "admin" | "customer") => {
    const u = loginAsRole(role);
    toast.success(`Xush kelibsiz, ${u.name}!`);
    if (role === "admin") {
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Profil"
        right={<ThemeToggle />}
      />

      <div className="space-y-5 px-4 pb-12 pt-2">
        {/* Welcome card */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-bold">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">Xush kelibsiz!</h2>
              <p className="text-xs text-muted-foreground">Profil va buyurtmalarni ko'rish</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ilovadan to'liq foydalanish, buyurtmalarni kuzatish va chatda yozish uchun hisobingizga kiring yoki yangi hisob oching.
          </p>
        </div>

        {/* Tab switch */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1 mb-4">
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                tab === "register"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ro'yxatdan o'tish
            </button>
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kirish (Admin)
            </button>
          </div>

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <Label className="text-xs">Ism va familiyangiz *</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Masalan: Jasur Rahimov"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Telefon raqam *</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Shahar / Tuman</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="Toshkent shahri"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Parol *</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Parol yarating"
                    className="h-11 rounded-xl pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98 disabled:opacity-50"
              >
                <span>Ro'yxatdan o'tish</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <Label className="text-xs">Telefon raqam yoki Login</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+998 90 123 45 67 yoki 'admin'"
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Parol</Label>
                  <span className="text-[11px] text-muted-foreground">Admin: admin</span>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Parolni kiriting"
                    className="h-11 rounded-xl pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98 disabled:opacity-50"
              >
                <span>Tizimga kirish</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-2 border-t border-border mt-3">
                <p className="mb-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Tezkor kirish
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuick("admin")}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Bosh Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuick("customer")}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold text-foreground transition hover:bg-secondary/80"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>Mijoz (Test)</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. REGISTERED PROFILE VIEW (Ro'yxatdan o'tgandan keyingi ko'rinish)
   ========================================================================= */
function RegisteredProfileView({
  user,
  isAdmin,
  onUpdate,
  onLogout,
}: {
  user: any;
  isAdmin: boolean;
  onUpdate: (data: any) => void;
  onLogout: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [city, setCity] = useState(user.city || "");
  const [email, setEmail] = useState(user.email || "");

  const orders: OrderItem[] = getUserOrders(user.id);
  const trades: TradeItem[] = getUserTrades(user.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Ismni kiriting");
      return;
    }
    onUpdate({ name: name.trim(), phone: phone.trim(), city: city.trim(), email: email.trim() });
    setIsEditing(false);
    toast.success("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
  };

  const handleLogoutClick = () => {
    onLogout();
    toast.info("Hisobdan chiqildi.");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Profil"
        right={<ThemeToggle />}
      />

      <div className="space-y-5 px-4 pb-12">
        {/* User Card */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-extrabold text-primary-foreground shadow-sm">
                {user.avatar || user.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display text-lg font-bold text-foreground">{user.name}</h2>
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent-foreground">
                    {user.role === "admin" ? "Admin" : "Mijoz"}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3" />
                  <span>{user.city || "Toshkent shahri"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex h-9 w-9 items-center justify-center rounded-full border bg-secondary text-foreground transition hover:bg-accent hover:text-accent-foreground"
              title="Tahrirlash"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div className="rounded-2xl bg-secondary/60 p-2.5">
              <p className="font-display text-lg font-bold text-foreground">{orders.length}</p>
              <p className="text-[10px] text-muted-foreground">Buyurtma</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-2.5">
              <p className="font-display text-lg font-bold text-foreground">{trades.length}</p>
              <p className="text-[10px] text-muted-foreground">Baholash</p>
            </div>
            <div className="rounded-2xl bg-secondary/60 p-2.5">
              <p className="font-display text-lg font-bold text-foreground">100%</p>
              <p className="text-[10px] text-muted-foreground">Ishonchli</p>
            </div>
          </div>
        </section>

        {/* Admin Panel Direct Link Button for Admin */}
        {isAdmin && (
          <Link
            to="/admin"
            className="flex w-full items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4 transition hover:bg-primary/20 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Boshqaruv Paneli (Admin)</p>
                <p className="text-xs text-muted-foreground">Mahsulotlar, buyurtmalar va statistika</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        )}

        {/* Edit Profile Form (collapsible) */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm">Ma'lumotlarni o'zgartirish</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Bekor qilish
              </button>
            </div>

            <div>
              <Label className="text-xs">Ism va familiya</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs">Telefon raqam</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs">Shahar / Tuman</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Toshkent shahri"
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="misol@gmail.com"
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-98"
            >
              O'zgarishlarni saqlash
            </button>
          </form>
        )}

        {/* Orders Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Package className="h-4 w-4 text-primary" />
              <span>Mening buyurtmalarim ({orders.length})</span>
            </h3>
            <Link to="/katalog" className="text-xs text-primary font-semibold hover:underline">
              Xarid qilish
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
              <p className="text-xs text-muted-foreground">Hozircha buyurtmalar yo'q.</p>
              <Link
                to="/katalog"
                className="mt-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
              >
                Katalogdan tanlash
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((o) => {
                const isDelivered = o.status === "delivered";
                const isShipping = o.status === "shipping";

                return (
                  <div
                    key={o.id}
                    className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-foreground leading-snug">
                          {o.product_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          ID: #{o.id.toUpperCase()} • {new Date(o.created_at).toLocaleDateString("ru-RU")}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isDelivered
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : isShipping
                            ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isDelivered ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : isShipping ? (
                          <Truck className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {o.status_label || (isDelivered ? "Yetkazildi" : "Kutilmoqda")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                      <span className="text-muted-foreground">Narxi:</span>
                      <span className="font-extrabold text-foreground">{formatPrice(o.price)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Trades Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
              <Calculator className="h-4 w-4 text-accent" />
              <span>Baholash arizalarim ({trades.length})</span>
            </h3>
            <Link to="/baholash" className="text-xs text-primary font-semibold hover:underline">
              Yangi ariza
            </Link>
          </div>

          {trades.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
              <p className="text-xs text-muted-foreground">Hozircha baholash arizalari yo'q.</p>
              <Link
                to="/baholash"
                className="mt-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
              >
                Telefonni baholatish
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {trades.map((t) => {
                const isRated = t.status === "rated";
                return (
                  <div
                    key={t.id}
                    className="rounded-2xl border border-border bg-card p-3.5 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-foreground">
                        {t.model} · {t.memory}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isRated
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isRated ? "Baholandi" : "Ko'rib chiqilmoqda"}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Batareya holati: <span className="text-foreground font-medium">{t.battery_range}</span>
                    </p>

                    {t.offer_price && (
                      <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3 py-2 text-xs">
                        <span className="text-muted-foreground">Taklif qilingan narx:</span>
                        <span className="font-extrabold text-foreground">
                          {formatPrice(t.offer_price)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Link
                        to="/chat"
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Chatda kelishish</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Logout button */}
        <div className="pt-2">
          <button
            onClick={handleLogoutClick}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 py-3.5 text-xs font-bold text-destructive transition hover:bg-destructive/20 active:scale-98 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Hisobdan chiqish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
