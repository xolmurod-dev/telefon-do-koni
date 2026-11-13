import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  Package,
  ClipboardList,
  ShoppingBag,
  MessagesSquare,
  ChevronLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PhoneCall,
  SendHorizontal,
  LogOut,
  ShieldCheck,
  Store,
  TrendingUp,
  BarChart3,
  Calendar,
  DollarSign,
  Archive,
  RotateCcw,
  Search,
  Smartphone,
  Cpu,
  Headphones,
  Check,
  Eye,
  Filter,
  Users,
  UserCheck,
  MessageCircle,
  MapPin,
  RefreshCw,
  Pencil,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAuth,
  getAllProducts,
  addProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  toggleOrderArchive,
  getAllTrades,
  updateTradeStatus,
  toggleTradeArchive,
  getUserChats,
  addUserChatMessage,
  ProductItem,
  OrderItem,
  TradeItem,
  loginAsRole,
  getSalesStatistics,
  SalesPeriod,
  getRegisteredCustomers,
  getAllChatThreads,
  ChatThread,
  getUserOrders,
  User,
} from "@/lib/auth";
import { formatPrice } from "@/lib/customer";
import { ProductArt } from "@/components/shop/ProductArt";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Paneli — PhoneHub" },
      { name: "description", content: "PhoneHub do'konini boshqarish tizimi." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, logout } = useAuth();

  // If not logged in as Admin, show Admin Login view
  if (!user || !isAdmin) {
    return <AdminLogin onLoggedIn={() => {}} />;
  }

  return <AdminDashboard user={user} onLogout={logout} />;
}

/* =========================================================================
   ADMIN LOGIN COMPONENT
   ========================================================================= */
function AdminLogin({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { login } = useAuth();
  const [loginInput, setLoginInput] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = login(loginInput, password);
      if (res.success && res.user) {
        if (res.user.role === "admin") {
          toast.success(`Xush kelibsiz, ${res.user.name}!`);
          onLoggedIn();
        } else {
          toast.error("Faqat tizim administratori uchun ruxsat berilgan.");
        }
      } else {
        toast.error(res.error || "Login yoki parol noto'g'ri");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = () => {
    const u = loginAsRole("admin");
    toast.success(`Xush kelibsiz, ${u.name}!`);
    onLoggedIn();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Do'konga qaytish</span>
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold text-foreground">Boshqaruv Paneli</h1>
            <p className="text-xs text-muted-foreground">Admin tizimiga kirish</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Login yoki Telefon</Label>
            <Input
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="'admin' yoki '+998 90 000 00 01'"
              className="mt-1 h-11 rounded-xl"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Parol</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parolni kiriting"
              className="mt-1 h-11 rounded-xl"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98 disabled:opacity-50"
          >
            Administrator sifatida kirish
          </button>
        </form>

        <div className="mt-6 border-t border-border pt-4">
          <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Tezkor test kirish
          </p>
          <button
            type="button"
            onClick={handleQuick}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Bosh Admin (1-bosishda kirish)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ADMIN DASHBOARD COMPONENT
   ========================================================================= */
const ADMIN_TABS = [
  { id: "stats", label: "Statistika", icon: BarChart3 },
  { id: "products", label: "Mahsulotlar", icon: Package },
  { id: "orders", label: "Buyurtmalar", icon: ShoppingBag },
  { id: "trades", label: "Baholash", icon: ClipboardList },
  { id: "users", label: "Mijozlar", icon: Users },
  { id: "chat", label: "Chat", icon: MessagesSquare },
] as const;

function AdminDashboard({
  user,
  onLogout,
}: {
  user: { name: string; role: string };
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<(typeof ADMIN_TABS)[number]["id"]>("stats");
  const [selectedChatUserId, setSelectedChatUserId] = useState<string>("demo-user-1");

  const [products, setProducts] = useState(() => getAllProducts());
  const [orders, setOrders] = useState(() => getAllOrders());
  const [trades, setTrades] = useState(() => getAllTrades());
  const [customers, setCustomers] = useState(() => getRegisteredCustomers());
  const [threads, setThreads] = useState(() => getAllChatThreads());

  // Listen to live system events so all data is reactive
  useEffect(() => {
    const handleSync = () => {
      setProducts(getAllProducts());
      setOrders(getAllOrders());
      setTrades(getAllTrades());
      setCustomers(getRegisteredCustomers());
      setThreads(getAllChatThreads());
    };

    window.addEventListener("ph-auth-change", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("ph-auth-change", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Counts
  const activeOrdersCount = orders.filter((o) => o.status === "pending" || o.status === "shipping").length;
  const pendingTradesCount = trades.filter((t) => t.status === "pending").length;
  const customersCount = customers.length;
  const unreadMessagesCount = threads.filter((t) => t.lastSender === "customer").length;

  const handleOpenChatWithUser = (userId: string) => {
    setSelectedChatUserId(userId);
    setTab("chat");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
          >
            <Store className="h-4 w-4" />
            <span>Do'konga o'tish</span>
          </Link>
          <div>
            <p className="font-display text-sm font-bold leading-tight">PhoneHub Boshqaruv</p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              {user.name} (Bosh Admin)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onLogout}
            title="Chiqish"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive transition hover:bg-destructive/20"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-6 rounded-2xl bg-secondary p-1 mb-5 gap-1">
          {ADMIN_TABS.map(({ id, label, icon: Icon }) => {
            const isCurrent = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition ${
                  isCurrent
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>

                {/* Badges for active orders, pending trades, customers, unread chat */}
                {id === "orders" && activeOrdersCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-extrabold text-primary-foreground">
                    {activeOrdersCount}
                  </span>
                )}
                {id === "trades" && pendingTradesCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-white">
                    {pendingTradesCount}
                  </span>
                )}
                {id === "users" && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-foreground/20 px-1 text-[10px] font-extrabold text-foreground">
                    {customersCount}
                  </span>
                )}
                {id === "chat" && unreadMessagesCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-extrabold text-white animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {tab === "stats" && <AdminSalesStatisticsSection customersCount={customersCount} />}
        {tab === "products" && <AdminProductsSection />}
        {tab === "orders" && <AdminOrdersSection />}
        {tab === "trades" && <AdminTradesSection />}
        {tab === "users" && (
          <AdminUsersSection onOpenChat={handleOpenChatWithUser} />
        )}
        {tab === "chat" && (
          <AdminChatSection
            selectedUserId={selectedChatUserId}
            onSelectUserId={setSelectedChatUserId}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   1. SALES STATISTICS SECTION (Kunlik, Haftalik, Oylik, Jami)
   ========================================================================= */
function AdminSalesStatisticsSection({ customersCount }: { customersCount: number }) {
  const [period, setPeriod] = useState<SalesPeriod>("day");
  const stats = useMemo(() => getSalesStatistics(period), [period]);

  const periods: { id: SalesPeriod; label: string; sub: string }[] = [
    { id: "day", label: "Kunlik", sub: "Bugun" },
    { id: "week", label: "Haftalik", sub: "Oxirgi 7 kun" },
    { id: "month", label: "Oylik", sub: "Ushbu oy" },
    { id: "all", label: "Jami", sub: "Umumiy" },
  ];

  const totalCatRevenue = stats.phoneRevenue + stats.partRevenue + stats.accessoryRevenue || 1;
  const phonePercent = Math.round((stats.phoneRevenue / totalCatRevenue) * 100);
  const partPercent = Math.round((stats.partRevenue / totalCatRevenue) * 100);
  const accPercent = Math.round((stats.accessoryRevenue / totalCatRevenue) * 100);

  return (
    <div className="space-y-4">
      {/* Header and Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Sotuv Statistikasi va Tushum</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Davr bo'yicha yakunlangan va yetkazilgan sotuvlar tahlili
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="inline-flex rounded-2xl bg-secondary p-1">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                period === p.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-primary mb-2">
            <span className="text-xs font-semibold">Jami Tushum</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="font-display text-xl font-extrabold text-foreground">
            {formatPrice(stats.totalRevenue)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stats.periodLabel}
          </p>
        </div>

        {/* Orders Count */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Yetkazilgan</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="font-display text-xl font-extrabold text-foreground">
            {stats.ordersCount} <span className="text-xs font-normal text-muted-foreground">ta</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Muvaffaqiyatli buyurtma
          </p>
        </div>

        {/* Average Check */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">O'rtacha Chek</span>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="font-display text-xl font-extrabold text-foreground">
            {formatPrice(stats.averageCheck)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            1 buyurtma uchun
          </p>
        </div>

        {/* Sold Items */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Sotilgan Mahsulot</span>
            <Package className="h-4 w-4 text-amber-500" />
          </div>
          <p className="font-display text-xl font-extrabold text-foreground">
            {stats.phoneCount + stats.partCount + stats.accessoryCount}{" "}
            <span className="text-xs font-normal text-muted-foreground">dona</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Barcha bo'limlardan
          </p>
        </div>

        {/* Registered Users Count KPI Card */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold">Mijozlar Bazasida</span>
            <Users className="h-4 w-4 text-purple-500" />
          </div>
          <p className="font-display text-xl font-extrabold text-foreground">
            {customersCount} <span className="text-xs font-normal text-muted-foreground">mijoz</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Ro'yxatdan o'tganlar
          </p>
        </div>
      </div>

      {/* Breakdown By Category (Bo'limlar bo'yicha sotuv tushumi) */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-foreground">
            Bo'limlar bo'yicha sotuv taqsimoti ({stats.periodLabel})
          </h3>
          <span className="text-xs font-semibold text-muted-foreground">
            Jami: {formatPrice(stats.totalRevenue)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Phones */}
          <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Smartphone className="h-4 w-4 text-primary" />
                Telefonlar
              </span>
              <span className="font-bold text-primary">{phonePercent}%</span>
            </div>
            <p className="font-display text-base font-extrabold text-foreground">
              {formatPrice(stats.phoneRevenue)}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${phonePercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sotildi: <b>{stats.phoneCount}</b> ta telefon
            </p>
          </div>

          {/* Parts */}
          <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Cpu className="h-4 w-4 text-blue-500" />
                Ehtiyot qismlar
              </span>
              <span className="font-bold text-blue-500">{partPercent}%</span>
            </div>
            <p className="font-display text-base font-extrabold text-foreground">
              {formatPrice(stats.partRevenue)}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${partPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sotildi: <b>{stats.partCount}</b> ta ehtiyot qism
            </p>
          </div>

          {/* Accessories */}
          <div className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <Headphones className="h-4 w-4 text-emerald-500" />
                Aksessuarlar
              </span>
              <span className="font-bold text-emerald-500">{accPercent}%</span>
            </div>
            <p className="font-display text-base font-extrabold text-foreground">
              {formatPrice(stats.accessoryRevenue)}
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${accPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sotildi: <b>{stats.accessoryCount}</b> ta aksessuar
            </p>
          </div>
        </div>
      </div>

      {/* Delivered Orders List in this period */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground">
          Ushbu davrda yetkazilgan buyurtmalar ({stats.deliveredOrders.length} ta)
        </h3>

        {stats.deliveredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            Ushbu davr uchun yetkazilgan sotuvlar mavjud emas. Buyurtmalarni "Yetkazildi" deb belgilaganingizda bu yerda aks etadi.
          </div>
        ) : (
          <div className="space-y-2">
            {stats.deliveredOrders.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-secondary/30 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">
                    {o.product_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Mijoz: {o.customer_name} • Sana:{" "}
                    {new Date(o.delivered_at || o.created_at).toLocaleString("uz-UZ", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-foreground">
                    {formatPrice(o.price)}
                  </p>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Yetkazilgan
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   2. PRODUCTS MANAGEMENT SECTION (Bo'limlarga ajratilgan)
   ========================================================================= */
type ProductCategoryTab = "all" | "phone" | "part" | "accessory";

const PRESET_PRODUCT_IMAGES = [
  {
    name: "iPhone",
    url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80",
    label: "📱 iPhone",
  },
  {
    name: "Samsung",
    url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
    label: "📱 Samsung",
  },
  {
    name: "AirPods",
    url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80",
    label: "🎧 AirPods",
  },
  {
    name: "Displey",
    url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80",
    label: "🔧 Displey",
  },
  {
    name: "Adapter",
    url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
    label: "⚡ Adapter",
  },
];

function ProductImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Iltimos, rasm faylini tanlang (JPG, PNG, WebP)");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 600;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            onChange(event.target?.result as string);
            setLoading(false);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.75);
          onChange(compressed);
          setLoading(false);
          toast.success("Rasm yuklandi!");
        };
        img.onerror = () => {
          onChange(event.target?.result as string);
          setLoading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Rasmni yuklashda xatolik yuz berdi");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">Mahsulot rasmi</Label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-bold text-destructive hover:underline flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Rasmni o'chirish</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {value ? (
        <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-2.5">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
            <img
              src={value}
              alt="Mahsulot rasmi"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-foreground truncate">Rasm biriktirilgan</p>
            <p className="text-[10px] text-muted-foreground">
              Katalogda va band qilish sahifasida ko'rinadi
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Boshqa rasmga almashtirish
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 py-2.5 px-3 text-xs font-bold text-primary transition hover:bg-primary/10 active:scale-98"
            >
              <Upload className="h-4 w-4" />
              <span>{loading ? "Yuklanmoqda..." : "Qurilmadan yuklash"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 px-3 text-xs font-semibold text-foreground transition hover:bg-secondary active:scale-98"
            >
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span>Rasm havolasi (URL)</span>
            </button>
          </div>

          {showUrlInput && (
            <div className="animate-in fade-in duration-150">
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          )}

          {/* Quick presets */}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground mb-1">
              Tezkor tayyor rasmlar:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRODUCT_IMAGES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className="rounded-lg border border-border/80 bg-secondary/50 px-2 py-1 text-[10px] font-medium text-foreground hover:border-primary hover:bg-primary/10 transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminProductsSection() {
  const [products, setProducts] = useState<ProductItem[]>(() => getAllProducts());
  const [activeCategory, setActiveCategory] = useState<ProductCategoryTab>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);

  // Add Product Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"phone" | "part" | "accessory">("phone");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [price, setPrice] = useState("");
  const [rom, setRom] = useState("128");
  const [ram, setRam] = useState("6");
  const [batteryHealth, setBatteryHealth] = useState("90");
  const [condition, setCondition] = useState("Ideal");
  const [color, setColor] = useState("Qora");
  const [compatibleModels, setCompatibleModels] = useState("");
  const [cover, setCover] = useState("");

  // Edit Product Form state
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState<"phone" | "part" | "accessory">("phone");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editBrand, setEditBrand] = useState("Apple");
  const [editPrice, setEditPrice] = useState("");
  const [editRom, setEditRom] = useState("128");
  const [editRam, setEditRam] = useState("6");
  const [editBatteryHealth, setEditBatteryHealth] = useState("90");
  const [editCondition, setEditCondition] = useState("Ideal");
  const [editColor, setEditColor] = useState("Qora");
  const [editCompatibleModels, setEditCompatibleModels] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "sold">("active");

  const refresh = () => setProducts(getAllProducts());

  // Real-time synchronization
  useEffect(() => {
    const sync = () => setProducts(getAllProducts());
    window.addEventListener("ph-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ph-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Count by category
  const counts = useMemo(() => {
    return {
      all: products.length,
      phone: products.filter((p) => p.category === "phone").length,
      part: products.filter((p) => p.category === "part").length,
      accessory: products.filter((p) => p.category === "accessory").length,
    };
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      // Status filter
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesSub = p.subcategory?.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSub) return false;
      }
      return true;
    });
  }, [products, activeCategory, statusFilter, searchQuery]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error("Nomi va narxini kiriting");
      return;
    }

    const cleanPrice = Number(price.replace(/\D/g, ""));
    const cleanCover = cover.trim();

    const newProd = addProduct({
      name: name.trim(),
      category,
      subcategory: category !== "phone" && subcategory ? subcategory : null,
      brand,
      price: cleanPrice,
      rom: category === "phone" ? rom : null,
      ram: category === "phone" ? ram : null,
      battery_health: category === "phone" && batteryHealth ? Number(batteryHealth) : null,
      condition,
      color: category === "phone" ? color : null,
      compatible_models: category === "part" ? compatibleModels : null,
      status: "active",
      cover: cleanCover || null,
      images: cleanCover ? [cleanCover] : [],
    });

    setProducts((prev) => [newProd, ...prev]);
    toast.success("Mahsulot muvaffaqiyatli qo'shildi!");
    setName("");
    setPrice("");
    setCompatibleModels("");
    setCover("");
    setOpenAdd(false);
  };

  const handleStartEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditCategory(p.category);
    setEditSubcategory(p.subcategory || "");
    setEditBrand(p.brand);
    setEditPrice(String(p.price));
    setEditRom(p.rom || "128");
    setEditRam(p.ram || "6");
    setEditBatteryHealth(p.battery_health != null ? String(p.battery_health) : "");
    setEditCondition(p.condition || "Ideal");
    setEditColor(p.color || "Qora");
    setEditCompatibleModels(p.compatible_models || "");
    setEditCover(p.cover || (p.images && p.images[0]) || "");
    setEditStatus(p.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editName.trim() || !editPrice) {
      toast.error("Nomi va narxini kiriting");
      return;
    }

    const cleanPrice = Number(editPrice.replace(/\D/g, ""));
    const cleanCover = editCover.trim();

    const updated = updateProduct(editingProduct.id, {
      name: editName.trim(),
      category: editCategory,
      subcategory: editCategory !== "phone" && editSubcategory ? editSubcategory : null,
      brand: editBrand,
      price: cleanPrice,
      rom: editCategory === "phone" ? editRom : null,
      ram: editCategory === "phone" ? editRam : null,
      battery_health: editCategory === "phone" && editBatteryHealth ? Number(editBatteryHealth) : null,
      condition: editCondition,
      color: editCategory === "phone" ? editColor : null,
      compatible_models: editCategory === "part" ? editCompatibleModels : null,
      cover: cleanCover || null,
      images: cleanCover ? [cleanCover] : [],
      status: editStatus,
    });

    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      toast.success("Mahsulot muvaffaqiyatli tahrirlandi!");
      setEditingProduct(null);
    } else {
      toast.error("Mahsulot topilmadi");
    }
  };

  const handleToggle = (id: string) => {
    toggleProductStatus(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "active" ? "sold" : "active" } : p
      )
    );
    toast.success("Mahsulot holati yangilandi");
  };

  const handleDelete = (id: string, prodName: string) => {
    if (confirm(`"${prodName}" ni o'chirishga ishonchingiz komilmi?`)) {
      deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Mahsulot o'chirildi");
    }
  };

  const categoryTabs: { id: ProductCategoryTab; label: string; icon: any; count: number }[] = [
    { id: "all", label: "Barchasi", icon: Filter, count: counts.all },
    { id: "phone", label: "Telefonlar", icon: Smartphone, count: counts.phone },
    { id: "part", label: "Ehtiyot qismlar", icon: Cpu, count: counts.part },
    { id: "accessory", label: "Aksessuarlar", icon: Headphones, count: counts.accessory },
  ];

  return (
    <div className="space-y-4">
      {/* Header and Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Mahsulotlar Bo'limi ({filteredProducts.length})
          </h2>
          <p className="text-xs text-muted-foreground">
            Mahsulotlarni bo'limlar bo'yicha saralash, tahrirlash va yangi qo'shish
          </p>
        </div>
        <button
          onClick={() => {
            if (activeCategory !== "all") {
              setCategory(activeCategory);
            }
            setOpenAdd(true);
          }}
          className="flex items-center gap-1.5 rounded-2xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {/* Category Tabs (Bo'limlar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {categoryTabs.map(({ id, label, icon: Icon, count }) => {
          const isActive = activeCategory === id;
          return (
            <button
              key={id}
              onClick={() => setActiveCategory(id)}
              className={`flex items-center justify-between rounded-2xl border p-3 text-left transition ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-xs font-bold">{label}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nomi yoki brendi bo'yicha qidiruv..."
            className="h-10 pl-9 rounded-xl text-xs"
          />
        </div>

        <div className="flex gap-1.5 self-start rounded-xl bg-secondary p-1">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "all" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "active" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Faol
          </button>
          <button
            onClick={() => setStatusFilter("sold")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "sold" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            Sotilgan
          </button>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          Ushbu bo'limda mahsulotlar topilmadi.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredProducts.map((p) => {
            const isSold = p.status === "sold";
            const categoryLabel =
              p.category === "phone"
                ? "Telefon"
                : p.category === "part"
                ? `Ehtiyot qism: ${p.subcategory || "Qism"}`
                : `Aksessuar: ${p.subcategory || "Jihoz"}`;

            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm transition hover:border-border/80"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-secondary border border-border/50">
                    <ProductArt category={p.category} src={p.cover} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="truncate text-xs font-bold text-foreground">{p.name}</p>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground">
                        {categoryLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.brand} • {p.rom ? `${p.rom} GB • ` : ""}
                      {p.battery_health ? `🔋 ${p.battery_health}% • ` : ""}
                      <span className="font-extrabold text-foreground">
                        {formatPrice(p.price)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggle(p.id)}
                    className={`rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                      isSold
                        ? "bg-muted text-muted-foreground hover:bg-secondary"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isSold ? "Sotilgan" : "Faol"}
                  </button>
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-95"
                    title="Mahsulotni tahrirlash"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition active:scale-95"
                    title="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Product Modal with Sections & Image Upload */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:max-w-md max-h-[90vh] overflow-y-auto thin-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Yangi mahsulot qo'shish
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3 pt-2">
            {/* Category Selector */}
            <div>
              <Label className="text-xs font-semibold">Bo'limni tanlang *</Label>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {(
                  [
                    { id: "phone", label: "📱 Telefon", sub: "Smartfon" },
                    { id: "part", label: "🔧 Ehtiyot qism", sub: "Qism va detallar" },
                    { id: "accessory", label: "🎧 Aksessuar", sub: "Jihozlar" },
                  ] as const
                ).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`rounded-xl border p-2 text-center transition ${
                      category === c.id
                        ? "border-primary bg-primary text-primary-foreground font-bold"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <p className="text-xs">{c.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Product Image Uploader */}
            <ProductImageUploader value={cover} onChange={setCover} />

            <div>
              <Label className="text-xs">Mahsulot nomi *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  category === "phone"
                    ? "Masalan: iPhone 14 Pro 128GB"
                    : category === "part"
                    ? "Masalan: iPhone 13 Pro OLED Displey"
                    : "Masalan: Apple 20W USB-C Adapter"
                }
                className="mt-1 h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Brend</Label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Honor">Honor</option>
                  <option value="Google Pixel">Google Pixel</option>
                  <option value="Boshqa">Boshqa</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Narxi (so'm) *</Label>
                <Input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="6500000"
                  className="mt-1 h-10 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            {/* Sub-fields for Phones */}
            {category === "phone" && (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Xotira (ROM)</Label>
                  <select
                    value={rom}
                    onChange={(e) => setRom(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-2 text-xs font-medium"
                  >
                    <option value="64">64 GB</option>
                    <option value="128">128 GB</option>
                    <option value="256">256 GB</option>
                    <option value="512">512 GB</option>
                    <option value="1024">1 TB</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Batareya %</Label>
                  <Input
                    type="number"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    placeholder="89"
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Rangi</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="Qora"
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for Parts */}
            {category === "part" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Qism turi</Label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                  >
                    <option value="Displey">Displey (Ekran)</option>
                    <option value="Akkumulyator">Akkumulyator (Batareya)</option>
                    <option value="Kamera">Kamera moduli</option>
                    <option value="Korpus">Korpus qismi</option>
                    <option value="Shleyf">Shleyf / Zaryadka uyasi</option>
                    <option value="Boshqa">Boshqa qism</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Mos modellar</Label>
                  <Input
                    value={compatibleModels}
                    onChange={(e) => setCompatibleModels(e.target.value)}
                    placeholder="iPhone 13, 13 Pro"
                    className="mt-1 h-10 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}

            {/* Sub-fields for Accessories */}
            {category === "accessory" && (
              <div>
                <Label className="text-xs">Aksessuar turi</Label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                >
                  <option value="G'ilof">G'ilof (Case)</option>
                  <option value="Zaryadlash bloki">Zaryadlash bloki (Adapter)</option>
                  <option value="USB kabel">USB Kabel (Lightning / Type-C)</option>
                  <option value="Quloqchin">Quloqchin (AirPods / Earphones)</option>
                  <option value="Himoya oynasi">Himoya oynasi (Steklo)</option>
                  <option value="Powerbank">Powerbank</option>
                  <option value="Boshqa">Boshqa jihoz</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs">Holati</Label>
              <Input
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Ideal / Yangi original"
                className="mt-1 h-10 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="mt-3 w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98"
            >
              Saqlash va chop etish
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal (Mahsulotni tahrirlash oynasi) */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:max-w-md max-h-[90vh] overflow-y-auto thin-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" />
              <span>Mahsulotni tahrirlash</span>
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
              {/* Category Selector */}
              <div>
                <Label className="text-xs font-semibold">Bo'lim</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {(
                    [
                      { id: "phone", label: "📱 Telefon" },
                      { id: "part", label: "🔧 Ehtiyot qism" },
                      { id: "accessory", label: "🎧 Aksessuar" },
                    ] as const
                  ).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCategory(c.id)}
                      className={`rounded-xl border p-2 text-center transition ${
                        editCategory === c.id
                          ? "border-primary bg-primary text-primary-foreground font-bold"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <p className="text-xs">{c.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Image Uploader */}
              <ProductImageUploader value={editCover} onChange={setEditCover} />

              <div>
                <Label className="text-xs">Mahsulot nomi *</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-10 rounded-xl text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Brend</Label>
                  <select
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Honor">Honor</option>
                    <option value="Google Pixel">Google Pixel</option>
                    <option value="Boshqa">Boshqa</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs">Narxi (so'm) *</Label>
                  <Input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="6500000"
                    className="mt-1 h-10 rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              {/* Status Switcher in Edit */}
              <div>
                <Label className="text-xs">Holati (Status)</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setEditStatus("active")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      editStatus === "active"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🟢 Faol (Sotuvda)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStatus("sold")}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      editStatus === "sold"
                        ? "border-muted bg-secondary text-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ⚪ Sotilgan
                  </button>
                </div>
              </div>

              {/* Sub-fields for Phones */}
              {editCategory === "phone" && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Xotira (ROM)</Label>
                    <select
                      value={editRom}
                      onChange={(e) => setEditRom(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-2 text-xs font-medium"
                    >
                      <option value="64">64 GB</option>
                      <option value="128">128 GB</option>
                      <option value="256">256 GB</option>
                      <option value="512">512 GB</option>
                      <option value="1024">1 TB</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Batareya %</Label>
                    <Input
                      type="number"
                      value={editBatteryHealth}
                      onChange={(e) => setEditBatteryHealth(e.target.value)}
                      placeholder="89"
                      className="mt-1 h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Rangi</Label>
                    <Input
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      placeholder="Qora"
                      className="mt-1 h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Sub-fields for Parts */}
              {editCategory === "part" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Qism turi</Label>
                    <select
                      value={editSubcategory}
                      onChange={(e) => setEditSubcategory(e.target.value)}
                      className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                    >
                      <option value="Displey">Displey (Ekran)</option>
                      <option value="Akkumulyator">Akkumulyator (Batareya)</option>
                      <option value="Kamera">Kamera moduli</option>
                      <option value="Korpus">Korpus qismi</option>
                      <option value="Shleyf">Shleyf / Zaryadka uyasi</option>
                      <option value="Boshqa">Boshqa qism</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">Mos modellar</Label>
                    <Input
                      value={editCompatibleModels}
                      onChange={(e) => setEditCompatibleModels(e.target.value)}
                      placeholder="iPhone 13, 13 Pro"
                      className="mt-1 h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Sub-fields for Accessories */}
              {editCategory === "accessory" && (
                <div>
                  <Label className="text-xs">Aksessuar turi</Label>
                  <select
                    value={editSubcategory}
                    onChange={(e) => setEditSubcategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium"
                  >
                    <option value="G'ilof">G'ilof (Case)</option>
                    <option value="Zaryadlash bloki">Zaryadlash bloki (Adapter)</option>
                    <option value="USB kabel">USB Kabel (Lightning / Type-C)</option>
                    <option value="Quloqchin">Quloqchin (AirPods / Earphones)</option>
                    <option value="Himoya oynasi">Himoya oynasi (Steklo)</option>
                    <option value="Powerbank">Powerbank</option>
                    <option value="Boshqa">Boshqa jihoz</option>
                  </select>
                </div>
              )}

              <div>
                <Label className="text-xs">Holati</Label>
                <Input
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value)}
                  placeholder="Ideal / Yangi original"
                  className="mt-1 h-10 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 rounded-2xl border border-border py-3 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition active:scale-98"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-98"
                >
                  O'zgarishlarni saqlash
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================================
   3. ORDERS MANAGEMENT SECTION (Faol va Arxiv bo'limlari)
   ========================================================================= */
function AdminOrdersSection() {
  const [orders, setOrders] = useState<OrderItem[]>(() => getAllOrders());
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  const refresh = () => setOrders(getAllOrders());

  useEffect(() => {
    const sync = () => setOrders(getAllOrders());
    window.addEventListener("ph-auth-change", sync);
    return () => window.removeEventListener("ph-auth-change", sync);
  }, []);

  // Active orders: pending or shipping
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status === "pending" || o.status === "shipping"),
    [orders]
  );

  // Archived orders: delivered or cancelled
  const archivedOrders = useMemo(
    () => orders.filter((o) => o.status === "delivered" || o.status === "cancelled" || o.archived),
    [orders]
  );

  const setStatus = (id: string, s: OrderItem["status"]) => {
    updateOrderStatus(id, s);
    refresh();
    if (s === "delivered") {
      toast.success("✅ Buyurtma yetkazildi va arxivga o'tkazildi!");
    } else if (s === "cancelled") {
      toast.info("Buyurtma bekor qilindi va arxivga saqlandi");
    } else {
      toast.success("Buyurtma holati yangilandi");
    }
  };

  const handleRestore = (id: string) => {
    updateOrderStatus(id, "pending");
    refresh();
    toast.success("Buyurtma qayta faol holatga qaytarildi");
  };

  const currentList = activeTab === "active" ? activeOrders : archivedOrders;

  return (
    <div className="space-y-4">
      {/* Header and Faol / Arxiv Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Buyurtmalar Boshqaruvi
          </h2>
          <p className="text-xs text-muted-foreground">
            Yetkazilgan buyurtmalar avtomatik ravishda arxivga o'tkaziladi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-secondary p-1">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "active"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Faol buyurtmalar</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeOrders.length > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "archive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Arxiv</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[10px] text-muted-foreground">
              {archivedOrders.length}
            </span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      {currentList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          {activeTab === "active"
            ? "Hozircha yangi faol buyurtmalar mavjud emas."
            : "Arxivda hozircha buyurtmalar mavjud emas."}
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((o) => {
            const isDelivered = o.status === "delivered";
            const isShipping = o.status === "shipping";
            const isCancelled = o.status === "cancelled";

            return (
              <div
                key={o.id}
                className={`rounded-2xl border bg-card p-4 shadow-sm space-y-3 transition ${
                  isDelivered
                    ? "border-emerald-500/30"
                    : isCancelled
                    ? "border-destructive/20 opacity-80"
                    : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{o.product_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mijoz: <span className="font-semibold text-foreground">{o.customer_name}</span> •{" "}
                      <a href={`tel:${o.customer_phone}`} className="text-primary underline">
                        {o.customer_phone}
                      </a>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Buyurtma sanasi: {new Date(o.created_at).toLocaleString("uz-UZ")}
                    </p>
                    {o.delivered_at && (
                      <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Yetkazilgan vaqt: {new Date(o.delivered_at).toLocaleString("uz-UZ")}
                      </p>
                    )}
                  </div>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isDelivered
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isShipping
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : isCancelled
                        ? "bg-destructive/15 text-destructive"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {o.status_label || o.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                  <span className="font-extrabold text-foreground">{formatPrice(o.price)}</span>

                  {/* Action buttons depend on whether it's active or archived */}
                  {activeTab === "active" ? (
                    <div className="flex gap-1.5">
                      {o.status !== "shipping" && (
                        <button
                          onClick={() => setStatus(o.id, "shipping")}
                          className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20"
                        >
                          🚚 Yo'lga chiqarish
                        </button>
                      )}
                      <button
                        onClick={() => setStatus(o.id, "delivered")}
                        className="rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-700"
                      >
                        ✅ Yetkazildi (Arxivga)
                      </button>
                      <button
                        onClick={() => setStatus(o.id, "cancelled")}
                        className="rounded-xl border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive hover:bg-destructive/20"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Archive className="h-3 w-3" /> Arxivlangan
                      </span>
                      <button
                        onClick={() => handleRestore(o.id)}
                        className="flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary/80"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Faollashtirish</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   4. TRADES MANAGEMENT SECTION (Baholash - Faol va Arxiv)
   ========================================================================= */
function AdminTradesSection() {
  const [trades, setTrades] = useState<TradeItem[]>(() => getAllTrades());
  const [activeTab, setActiveTab] = useState<"pending" | "archive">("pending");
  const [prices, setPrices] = useState<Record<string, string>>({});

  const refresh = () => setTrades(getAllTrades());

  useEffect(() => {
    const sync = () => setTrades(getAllTrades());
    window.addEventListener("ph-auth-change", sync);
    return () => window.removeEventListener("ph-auth-change", sync);
  }, []);

  // Pending trades
  const pendingTrades = useMemo(
    () => trades.filter((t) => t.status === "pending"),
    [trades]
  );

  // Archived trades (rated or rejected)
  const archivedTrades = useMemo(
    () => trades.filter((t) => t.status !== "pending" || t.archived),
    [trades]
  );

  const handleRate = (t: TradeItem) => {
    const p = prices[t.id];
    if (!p) {
      toast.error("Taklif narxini kiriting");
      return;
    }
    const num = Number(p.replace(/\D/g, ""));
    updateTradeStatus(t.id, "rated", num);
    if (t.customer_id) {
      addUserChatMessage(
        t.customer_id,
        "shop",
        `📱 ${t.model} (${t.memory}) bo'yicha arizangiz ko'rib chiqildi! Sizga taklif narximiz: ${formatPrice(
          num
        )}. Do'konga olib kelsangiz darhol naqdga yoki yangi telefonga almashtirib beramiz!`
      );
    }
    refresh();
    toast.success("✅ Baholash narxi belgilandi va arxivga olindi!");
  };

  const handleReject = (t: TradeItem) => {
    updateTradeStatus(t.id, "rejected");
    if (t.customer_id) {
      addUserChatMessage(
        t.customer_id,
        "shop",
        `Afsuski, ${t.model} bo'yicha arizangiz mutaxassislar tomonidan rad etildi.`
      );
    }
    refresh();
    toast.info("Ariza rad etildi va arxivga o'tkazildi");
  };

  const handleRestore = (id: string) => {
    updateTradeStatus(id, "pending");
    refresh();
    toast.success("Ariza qayta ko'rib chiqish ro'yxatiga qaytarildi");
  };

  const currentList = activeTab === "pending" ? pendingTrades : archivedTrades;

  return (
    <div className="space-y-4">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">
            Baholash Arizalari (Trade-in)
          </h2>
          <p className="text-xs text-muted-foreground">
            Baholangan arizalar avtomatik ravishda arxivga o'tkaziladi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-2xl bg-secondary p-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "pending"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>Kutilayotganlar</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                pendingTrades.length > 0
                  ? "bg-amber-500 text-white"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {pendingTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              activeTab === "archive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Archive className="h-3.5 w-3.5" />
            <span>Arxiv</span>
            <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[10px] text-muted-foreground">
              {archivedTrades.length}
            </span>
          </button>
        </div>
      </div>

      {/* Trades List */}
      {currentList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          {activeTab === "pending"
            ? "Hozircha ko'rib chiqish kutilayotgan baholash arizalari yo'q."
            : "Arxivda baholangan arizalar mavjud emas."}
        </div>
      ) : (
        <div className="space-y-3">
          {currentList.map((t) => {
            const isRated = t.status === "rated";
            const isRejected = t.status === "rejected";

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t.model} • {t.memory}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mijoz: <span className="font-semibold text-foreground">{t.customer_name}</span> •{" "}
                      <a href={`tel:${t.customer_phone}`} className="text-primary underline">
                        {t.customer_phone}
                      </a>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Yuborilgan sana: {new Date(t.created_at).toLocaleString("uz-UZ")}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      isRated
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isRejected
                        ? "bg-destructive/15 text-destructive"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {t.status_label || (isRated ? "Baholandi" : "Ko'rib chiqilmoqda")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  Batareya holati: <span className="text-foreground font-semibold">{t.battery_range}</span>
                </p>

                {t.offer_price && (
                  <p className="text-xs text-foreground font-medium">
                    Belgilangan taklif narxi: <b className="text-primary">{formatPrice(t.offer_price)}</b>
                  </p>
                )}

                {activeTab === "pending" ? (
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Input
                      placeholder="Taklif narxi (so'm)"
                      value={prices[t.id] ?? (t.offer_price?.toString() || "")}
                      onChange={(e) =>
                        setPrices({ ...prices, [t.id]: e.target.value.replace(/\D/g, "") })
                      }
                      className="h-9 rounded-xl text-xs"
                    />
                    <button
                      onClick={() => handleRate(t)}
                      className="rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 shrink-0"
                    >
                      Baholash & Arxiv
                    </button>
                    <button
                      onClick={() => handleReject(t)}
                      className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 text-xs font-bold text-destructive hover:bg-destructive/20 shrink-0"
                    >
                      Rad etish
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Archive className="h-3 w-3" /> Arxivda saqlangan
                    </span>
                    <button
                      onClick={() => handleRestore(t.id)}
                      className="flex items-center gap-1 rounded-xl border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary/80"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Qayta ko'rib chiqish</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   5. REGISTERED USERS MANAGEMENT SECTION (Ro'yxatdan o'tgan mijozlar)
   ========================================================================= */
function AdminUsersSection({ onOpenChat }: { onOpenChat: (userId: string) => void }) {
  const [customers, setCustomers] = useState<User[]>(() => getRegisteredCustomers());
  const [search, setSearch] = useState("");

  const refresh = () => setCustomers(getRegisteredCustomers());

  useEffect(() => {
    const sync = () => setCustomers(getRegisteredCustomers());
    window.addEventListener("ph-auth-change", sync);
    return () => window.removeEventListener("ph-auth-change", sync);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Ro'yxatdan O'tgan Mijozlar ({customers.length} ta)</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Ilovada ro'yxatdan o'tgan barcha faol foydalanuvchilar bazasi
          </p>
        </div>

        <button
          onClick={refresh}
          className="flex items-center gap-1.5 self-start rounded-xl border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/80"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mijoz ismi, telefon raqami yoki shahri bo'yicha qidirish..."
          className="h-10 pl-9 rounded-xl text-xs"
        />
      </div>

      {/* Users List */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
          Mijozlar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((c) => {
            const userOrders = getUserOrders(c.id);

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 transition hover:border-border/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs">
                      {c.avatar || c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{c.name}</p>
                      <a
                        href={`tel:${c.phone}`}
                        className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>{c.phone}</span>
                      </a>
                    </div>
                  </div>

                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {userOrders.length} buyurtma
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 border-t border-border/50 pt-2.5">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{c.city || "Toshkent shahri"}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>
                      Ro'yxatdan o'tgan: {new Date(c.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </p>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => onOpenChat(c.id)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 py-2 text-xs font-bold text-primary transition hover:bg-primary/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Mijoz bilan chatda yozishish</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   6. CHAT MANAGEMENT SECTION (Real-time to'liq va dinamik chat)
   ========================================================================= */
function AdminChatSection({
  selectedUserId,
  onSelectUserId,
}: {
  selectedUserId: string;
  onSelectUserId: (id: string) => void;
}) {
  const [threads, setThreads] = useState<ChatThread[]>(() => getAllChatThreads());
  const [searchThread, setSearchThread] = useState("");
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync threads and live messages
  useEffect(() => {
    const sync = () => {
      const all = getAllChatThreads();
      setThreads(all);
    };
    sync();

    window.addEventListener("ph-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ph-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Current active messages
  const messages = getUserChats(selectedUserId);

  // Scroll to bottom on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedUserId]);

  // Filter threads by search query
  const filteredThreads = useMemo(() => {
    if (!searchThread.trim()) return threads;
    const q = searchThread.toLowerCase();
    return threads.filter(
      (t) =>
        t.customer_name.toLowerCase().includes(q) ||
        (t.customer_phone && t.customer_phone.toLowerCase().includes(q))
    );
  }, [threads, searchThread]);

  // Selected thread object
  const currentThread = threads.find((t) => t.id === selectedUserId) || threads[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    addUserChatMessage(selectedUserId, "shop", replyText.trim());
    setReplyText("");
    toast.success("Javob yuborildi!");
  };

  const handleQuickSend = (text: string) => {
    addUserChatMessage(selectedUserId, "shop", text);
    toast.success("Tezkor javob yuborildi!");
  };

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border min-h-[560px]">
        {/* Left Side: Threads list */}
        <div className="p-3.5 space-y-3 bg-card/60">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
              <MessagesSquare className="h-4 w-4 text-primary" />
              <span>Suhbatlar ({threads.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">Jonli aloqa</span>
          </div>

          {/* Search threads */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchThread}
              onChange={(e) => setSearchThread(e.target.value)}
              placeholder="Mijoz qidirish..."
              className="h-8 pl-8 rounded-xl text-xs"
            />
          </div>

          {/* Thread list items */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">Mijoz topilmadi</p>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === selectedUserId;
                const isCustomerLast = t.lastSender === "customer";

                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectUserId(t.id)}
                    className={`flex w-full items-center gap-2.5 rounded-2xl p-2.5 text-left transition ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "hover:bg-secondary/70 text-foreground"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold ${
                        isSelected
                          ? "bg-primary-foreground text-primary"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      {t.customer_name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-xs font-bold leading-tight">
                          {t.customer_name}
                        </p>
                        {isCustomerLast && (
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isSelected ? "bg-white" : "bg-emerald-500 animate-pulse"
                            }`}
                            title="Yangi xabar"
                          />
                        )}
                      </div>
                      <p
                        className={`truncate text-[11px] mt-0.5 ${
                          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {isCustomerLast ? "Mijoz: " : "Siz: "}
                        {t.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Conversation Area */}
        <div className="md:col-span-2 flex flex-col h-full bg-background/50">
          {/* Conversation Header */}
          <div className="flex items-center justify-between border-b border-border p-3.5 bg-card/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs">
                {currentThread?.customer_name?.slice(0, 2).toUpperCase() || "M"}
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">
                  {currentThread?.customer_name || "Mijoz"}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                  {currentThread?.customer_phone && (
                    <a
                      href={`tel:${currentThread.customer_phone}`}
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      <PhoneCall className="h-3 w-3" />
                      <span>{currentThread.customer_phone}</span>
                    </a>
                  )}
                  {currentThread?.city && <span>• {currentThread.city}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Jonli bog'langan
              </span>
            </div>
          </div>

          {/* Messages Bubble Area */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[360px] min-h-[300px]">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Ushbu mijoz bilan xabarlar mavjud emas. Pastdagi maydon orqali birinchi bo'lib yozing.
              </div>
            ) : (
              messages.map((m) => {
                const isShop = m.sender === "shop";
                return (
                  <div
                    key={m.id}
                    className={`flex ${isShop ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isShop
                          ? "rounded-br-xs bg-primary text-primary-foreground font-medium"
                          : "rounded-bl-xs border border-border bg-card text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1 font-semibold">
                        <span>{isShop ? "Siz (Admin)" : m.customer_name || "Mijoz"}</span>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString("uz-UZ", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="px-4 py-2 border-t border-border/50 bg-secondary/30 flex gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => handleQuickSend("Assalomu alaykum! Savolingiz bo'yicha yordam beramiz.")}
              className="rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary shrink-0"
            >
              👋 Salomlashish
            </button>
            <button
              onClick={() => handleQuickSend("Ha, ushbu model do'konimizda mavjud!")}
              className="rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary shrink-0"
            >
              ✅ Mavjud
            </button>
            <button
              onClick={() => handleQuickSend("Buyurtmangiz tayyorlanib yo'lga chiqarilmoqda.")}
              className="rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary shrink-0"
            >
              🚚 Yo'lga chiqdi
            </button>
            <button
              onClick={() => handleQuickSend("+998 71 200-00-00 raqami orqali ham bog'lanishingiz mumkin.")}
              className="rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary shrink-0"
            >
              📞 Telefon raqam
            </button>
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendReply} className="p-3 border-t border-border bg-card flex gap-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Mijozga javob yozing (Enter bosing)..."
              className="h-11 rounded-xl text-xs"
            />
            <button
              type="submit"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition"
            >
              <SendHorizontal className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
