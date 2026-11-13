import { useState } from "react";
import { Smartphone, Lock, User as UserIcon, Phone, MapPin, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { DEMO_USERS, useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

export function AuthScreen() {
  const { login, register, loginAsDemo } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [loginPhone, setLoginPhone] = useState("+998 90 123 45 67");
  const [loginPassword, setLoginPassword] = useState("123");

  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("+998 ");
  const [regCity, setRegCity] = useState("Toshkent shahri");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = login(loginPhone, loginPassword);
      if (res.success && res.user) {
        toast.success(`Xush kelibsiz, ${res.user.name}!`);
      } else {
        toast.error(res.error || "Kirishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

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
        toast.success(`Muvaffaqiyatli ro'yxatdan o'tdingiz! Xush kelibsiz, ${res.user.name}!`);
      } else {
        toast.error(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (demoId: string) => {
    const user = loginAsDemo(demoId);
    if (user) {
      toast.success(`Namuna hisobga kirildi: ${user.name}`);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-between bg-background px-4 py-6">
      {/* Top bar with ThemeToggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tight">PhoneHub</h1>
            <p className="text-[11px] text-muted-foreground">Original telefonlar va ehtiyot qismlar</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Main Container */}
      <div className="my-auto py-6">
        {/* Welcome Banner */}
        <div className="mb-6 rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm">Xavfsiz kirish tizimi</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Ilovadan foydalanish, narxlarni ko'rish, chatda yozish va buyurtma berish uchun tizimga kiring yoki ro'yxatdan o'ting.
              </p>
            </div>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="rounded-3xl border bg-card p-5 shadow-md">
          <div className="grid grid-cols-2 rounded-2xl bg-secondary p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                tab === "login"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kirish
            </button>
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
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Telefon raqam
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Parol</label>
                  <span className="text-[11px] text-muted-foreground">Namuna parol: 123</span>
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                <span>Tizimga kirish</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="mt-5 space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Ism va familiyangiz
                </label>
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
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Telefon raqam
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+998 90 000 00 00"
                    className="h-11 w-full rounded-2xl border bg-background pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Shahar / Tuman (Yetkazib berish uchun)
                </label>
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
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Yangi parol o'ylab toping
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Kamida 4 ta belgi"
                    className="h-11 w-full rounded-2xl border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
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
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                <span>Ro'yxatdan o'tish</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>

        {/* Quick Demo Section (Namuna hisoblar) */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Namuna hisoblar bilan sinash</span>
            </div>
            <span className="text-[11px] text-muted-foreground">1-bosishda kirish</span>
          </div>

          <div className="space-y-2.5">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemoSelect(demo.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-3.5 text-left transition hover:border-primary/50 hover:bg-accent/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xs font-extrabold text-primary-foreground">
                    {demo.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground">{demo.name}</p>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Namuna
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{demo.phone} • {demo.city?.split(",")[0]}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
                  <span>Kirish</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-muted-foreground">
        <p>© 2026 PhoneHub UZ. Barcha huquqlar himoyalangan.</p>
      </div>
    </div>
  );
}
