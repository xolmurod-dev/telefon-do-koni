import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, Lock, User as UserIcon, Phone, MapPin, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, loginAsRole } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

export function AuthModal() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"register" | "login">("register");
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+998 ");
  const [regCity, setRegCity] = useState("Toshkent shahri");
  const [regPassword, setRegPassword] = useState("");

  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: "register" | "login"; message?: string }>;
      if (custom.detail?.mode) setTab(custom.detail.mode);
      if (custom.detail?.message) setMessage(custom.detail.message);
      else setMessage("");
      setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    window.addEventListener("ph-open-auth-modal", handleOpen);
    window.addEventListener("ph-close-auth-modal", handleClose);

    return () => {
      window.removeEventListener("ph-open-auth-modal", handleOpen);
      window.removeEventListener("ph-close-auth-modal", handleClose);
    };
  }, []);

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
        toast.success(`Xush kelibsiz, ${res.user.name}!`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } catch (err: any) {
      toast.error(err?.message || "Xatolik yuz berdi");
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
        setIsOpen(false);
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

  const handleQuickLogin = (role: "admin" | "customer") => {
    const user = loginAsRole(role);
    toast.success(`Tizimga kirildi: ${user.name}`);
    setIsOpen(false);
    if (role === "admin") {
      navigate({ to: "/admin" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-extrabold tracking-tight">
                PhoneHub
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Original telefonlar va ehtiyot qismlar
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Action notice message if user clicked something restricted */}
        {message ? (
          <div className="rounded-2xl border border-accent/40 bg-accent/15 p-3 text-xs font-semibold text-foreground leading-snug">
            ⚠️ {message}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-secondary/50 p-3 text-xs text-muted-foreground">
            Telefonlarni ko'rish, buyurtma berish va chatdan foydalanish uchun hisobingizga kiring yoki ro'yxatdan o'ting.
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
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
            className={`rounded-xl py-2 text-xs font-bold transition-all ${
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
          <form onSubmit={handleRegister} className="space-y-3 pt-1">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Ism va familiya *</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Masalan: Sardor Aliyev"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Telefon raqam *</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Shahar / Tuman</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="Toshkent shahri"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Parol *</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Parol yarating"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <span>Ro'yxatdan o'tish</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Telefon raqam yoki Login
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="+998 90 123 45 67 yoki 'admin'"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Parol</label>
                <span className="text-[11px] text-muted-foreground">Admin paroli: admin</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="h-11 w-full rounded-2xl border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            >
              <span>Kirish</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Quick Login Role Shortcuts */}
            <div className="pt-2">
              <p className="mb-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Tezkor kirish
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("admin")}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Bosh Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("customer")}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-bold text-foreground transition hover:bg-secondary/80"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Mijoz (Test)</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
