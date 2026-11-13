import { useEffect, useState } from "react";

export type UserRole = "customer" | "admin";

export type User = {
  id: string;
  token: string;
  name: string;
  phone: string;
  password?: string;
  email?: string;
  city?: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  product_id?: string;
  product_name: string;
  category?: "phone" | "part" | "accessory";
  price: number;
  status: "pending" | "shipping" | "delivered" | "cancelled";
  status_label: string;
  created_at: string;
  delivered_at?: string;
  archived?: boolean;
};

export type TradeItem = {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  model: string;
  memory: string;
  battery_range: string;
  offer_price: number | null;
  status: "pending" | "rated" | "rejected";
  status_label: string;
  created_at: string;
  rated_at?: string;
  archived?: boolean;
};

export type ChatItem = {
  id: string;
  customer_id?: string;
  customer_name?: string;
  sender: "customer" | "shop";
  text: string;
  created_at: string;
  delivered?: boolean;
};

export type ProductItem = {
  id: string;
  category: "phone" | "part" | "accessory";
  subcategory?: string | null;
  name: string;
  brand: string;
  price: number;
  ram?: string | null;
  rom?: string | null;
  condition?: string | null;
  color?: string | null;
  battery_health?: number | null;
  repaired?: boolean;
  compatible_models?: string | null;
  images: string[];
  cover?: string | null;
  status: "active" | "sold";
  created_at: string;
};

// Pre-defined System Users
export const SYSTEM_USERS: User[] = [
  {
    id: "user-admin",
    token: "tok_admin_phonehub_master",
    name: "Bosh Admin (PhoneHub)",
    phone: "+998 90 000 00 01",
    password: "admin",
    email: "admin@phonehub.uz",
    city: "Toshkent shahri",
    avatar: "AD",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "demo-user-1",
    token: "tok_jasur_rahimov_sample_01",
    name: "Jasur Rahimov",
    phone: "+998 90 123 45 67",
    password: "123",
    email: "jasur.rahimov@gmail.com",
    city: "Toshkent shahri, Chilonzor",
    avatar: "JR",
    role: "customer",
    createdAt: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "demo-user-2",
    token: "tok_malika_yusupova_sample_02",
    name: "Malika Yusupova",
    phone: "+998 97 765 43 21",
    password: "123",
    email: "malika.y@mail.uz",
    city: "Samarqand shahri",
    avatar: "MY",
    role: "customer",
    createdAt: "2026-10-01T12:00:00.000Z",
  },
];

// Sample Initial Products
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    category: "phone",
    name: "iPhone 13 Pro",
    brand: "Apple",
    price: 7200000,
    ram: "6",
    rom: "256",
    condition: "Ideal",
    color: "Sierra Blue",
    battery_health: 89,
    repaired: false,
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-2",
    category: "phone",
    name: "iPhone 11",
    brand: "Apple",
    price: 3900000,
    ram: "4",
    rom: "128",
    condition: "Yaxshi",
    color: "Qora",
    battery_health: 84,
    repaired: false,
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-3",
    category: "phone",
    name: "Samsung Galaxy S23",
    brand: "Samsung",
    price: 6100000,
    ram: "8",
    rom: "256",
    condition: "Ideal",
    color: "Phantom Black",
    battery_health: 94,
    repaired: false,
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-4",
    category: "part",
    subcategory: "Displey",
    name: "iPhone 13 Pro OLED Displey",
    brand: "Apple",
    price: 1600000,
    condition: "Yangi (Original)",
    compatible_models: "iPhone 13 Pro",
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-5",
    category: "accessory",
    subcategory: "Quloqchin",
    name: "AirPods Pro 2 (USB-C)",
    brand: "Apple",
    price: 2450000,
    condition: "Yangi",
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "prod-6",
    category: "accessory",
    subcategory: "Zaryadlash bloki",
    name: "Apple 20W USB-C Adapter",
    brand: "Apple",
    price: 240000,
    condition: "Yangi (Original)",
    images: [],
    status: "active",
    created_at: new Date().toISOString(),
  },
];

const STORAGE_KEYS = {
  CURRENT_USER: "ph_active_user",
  USERS: "ph_registered_users",
  ORDERS: "ph_all_orders",
  TRADES: "ph_all_trades",
  CHATS: "ph_user_chats",
  PRODUCTS: "ph_all_products",
  TOKEN: "ph_token",
  PROFILE: "ph_profile",
};

// Storage listeners
let listeners: Array<() => void> = [];
function notifyListeners() {
  listeners.forEach((l) => l());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ph-auth-change"));
  }
}

export function getStoredUsers(): User[] {
  if (typeof window === "undefined") return SYSTEM_USERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SYSTEM_USERS));
      return SYSTEM_USERS;
    }
    const parsed: User[] = JSON.parse(data);
    const map = new Map<string, User>();
    SYSTEM_USERS.forEach((u) => map.set(u.phone, u));
    parsed.forEach((u) => map.set(u.phone, u));
    return Array.from(map.values());
  } catch {
    return SYSTEM_USERS;
  }
}

// Current active user: NULL if unregistered!
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, user.token);
    localStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify({ name: user.name, phone: user.phone })
    );
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  }
  notifyListeners();
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function registerUser(data: {
  name: string;
  phone: string;
  password?: string;
  city?: string;
}): { success: boolean; error?: string; user?: User } {
  try {
    const cleanPhone = (data.phone || "").trim();
    const cleanName = (data.name || "").trim();

    if (cleanName.length < 2) {
      return { success: false, error: "Ism kamida 2 ta harfdan iborat bo'lishi kerak" };
    }
    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      return { success: false, error: "To'g'ri telefon raqam kiriting (masalan: +998 90 123 45 67)" };
    }

    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.phone.replace(/\D/g, "") === digitsOnly
    );

    if (existing) {
      return { success: false, error: "Bu telefon raqam allaqachon ro'yxatdan o'tgan. Iltimos, 'Kirish' bo'limiga o'ting." };
    }

    const initials = cleanName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const newUser: User = {
      id: "user_" + Date.now(),
      token: "tok_" + safeUUID().replace(/-/g, "").slice(0, 24),
      name: cleanName,
      phone: cleanPhone,
      password: data.password || "123456",
      city: data.city?.trim() || "Toshkent shahri",
      avatar: initials || "PH",
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // Initialize welcome chat
    const welcomeMsg: ChatItem = {
      id: "msg_welcome_" + Date.now(),
      customer_id: newUser.id,
      customer_name: newUser.name,
      sender: "shop",
      text: `Assalomu alaykum, ${cleanName}! PhoneHub rasmiy do'koniga xush kelibsiz. Telefonlar, ehtiyot qismlar yoki baholatish bo'yicha savollaringiz bo'lsa, bemalol yozing!`,
      created_at: new Date().toISOString(),
      delivered: true,
    };
    saveUserChats(newUser.id, [welcomeMsg]);

    setCurrentUser(newUser);
    return { success: true, user: newUser };
  } catch (err: any) {
    console.error("Register error:", err);
    return { success: false, error: err?.message || "Ro'yxatdan o'tishda xatolik yuz berdi" };
  }
}

export function loginUser(
  phoneOrLogin: string,
  password?: string
): { success: boolean; error?: string; user?: User } {
  const rawInput = phoneOrLogin.trim().toLowerCase();
  const cleanDigits = rawInput.replace(/\D/g, "");
  const users = getStoredUsers();

  const user = users.find((u) => {
    const uDigits = u.phone.replace(/\D/g, "");
    if (cleanDigits && uDigits === cleanDigits) return true;
    if (rawInput === "admin" && u.role === "admin") return true;
    if (u.email && u.email.toLowerCase() === rawInput) return true;
    return false;
  });

  if (!user) {
    return {
      success: false,
      error: "Bunday foydalanuvchi topilmadi. Avval ro'yxatdan o'ting.",
    };
  }

  if (password && user.password && user.password !== password) {
    return { success: false, error: "Parol noto'g'ri kiritildi" };
  }

  setCurrentUser(user);
  return { success: true, user };
}

export function loginAsRole(role: "admin" | "customer"): User {
  const user = SYSTEM_USERS.find((u) => u.role === role) || SYSTEM_USERS[0];
  setCurrentUser(user);
  return user;
}

export function logoutUser() {
  setCurrentUser(null);
}

export function updateUserProfile(data: Partial<User>): User | null {
  const current = getCurrentUser();
  if (!current) return null;

  const updated: User = { ...current, ...data };
  const users = getStoredUsers().map((u) => (u.id === current.id ? updated : u));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(updated);
  return updated;
}

// Global Auth Modal trigger
export function openAuthModal(mode: "register" | "login" = "register", message?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ph-open-auth-modal", {
        detail: { mode, message },
      })
    );
  }
}

export function closeAuthModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ph-close-auth-modal"));
  }
}

// Helper to generate realistic seed orders relative to current time
function createInitialOrders(): OrderItem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;

  return [
    {
      id: "ord-101",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      product_name: "iPhone 13 Pro 256GB Sierra Blue",
      category: "phone",
      price: 7200000,
      status: "delivered",
      status_label: "Yetkazib berildi",
      created_at: new Date(now - 3 * hourMs).toISOString(),
      delivered_at: new Date(now - 1 * hourMs).toISOString(),
      archived: true,
    },
    {
      id: "ord-102",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      product_name: "Apple 20W USB-C Adapter",
      category: "accessory",
      price: 240000,
      status: "delivered",
      status_label: "Yetkazib berildi",
      created_at: new Date(now - 6 * hourMs).toISOString(),
      delivered_at: new Date(now - 4 * hourMs).toISOString(),
      archived: true,
    },
    {
      id: "ord-103",
      customer_id: "demo-user-2",
      customer_name: "Malika Yusupova",
      customer_phone: "+998 97 765 43 21",
      product_name: "AirPods Pro 2 (USB-C)",
      category: "accessory",
      price: 2450000,
      status: "delivered",
      status_label: "Yetkazib berildi",
      created_at: new Date(now - 2 * dayMs).toISOString(),
      delivered_at: new Date(now - 2 * dayMs + 4 * hourMs).toISOString(),
      archived: true,
    },
    {
      id: "ord-104",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      product_name: "iPhone 13 Pro OLED Displey",
      category: "part",
      price: 1600000,
      status: "delivered",
      status_label: "Yetkazib berildi",
      created_at: new Date(now - 4 * dayMs).toISOString(),
      delivered_at: new Date(now - 4 * dayMs + 5 * hourMs).toISOString(),
      archived: true,
    },
    {
      id: "ord-105",
      customer_id: "demo-user-2",
      customer_name: "Malika Yusupova",
      customer_phone: "+998 97 765 43 21",
      product_name: "Samsung Galaxy S23 256GB",
      category: "phone",
      price: 6100000,
      status: "delivered",
      status_label: "Yetkazib berildi",
      created_at: new Date(now - 12 * dayMs).toISOString(),
      delivered_at: new Date(now - 12 * dayMs + 3 * hourMs).toISOString(),
      archived: true,
    },
    {
      id: "ord-106",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      product_name: "iPhone 11 128GB Qora",
      category: "phone",
      price: 3900000,
      status: "pending",
      status_label: "Ko'rib chiqilmoqda",
      created_at: new Date(now - 30 * 60 * 1000).toISOString(),
      archived: false,
    },
    {
      id: "ord-107",
      customer_id: "demo-user-2",
      customer_name: "Malika Yusupova",
      customer_phone: "+998 97 765 43 21",
      product_name: "iPhone 13 Pro G'ilof (Silicone Case)",
      category: "accessory",
      price: 120000,
      status: "shipping",
      status_label: "Yo'lda (Yetkazilmoqda)",
      created_at: new Date(now - 2 * hourMs).toISOString(),
      archived: false,
    },
  ];
}

// Orders management (All orders for admin, user orders for customer)
export function getAllOrders(): OrderItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (raw) {
      const parsed: OrderItem[] = JSON.parse(raw);
      // Migrate / enrich older orders if needed
      if (parsed.length > 0 && parsed[0].category) {
        return parsed;
      }
    }
    const initial = createInitialOrders();
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

export function getUserOrders(userId?: string): OrderItem[] {
  const all = getAllOrders();
  if (!userId) return all;
  return all.filter((o) => o.customer_id === userId);
}

export function addOrder(order: {
  product_name: string;
  price: number;
  product_id?: string;
  category?: "phone" | "part" | "accessory";
  customer?: { id: string; name: string; phone: string };
}): OrderItem {
  const current = getCurrentUser();
  const all = getAllOrders();
  const newOrder: OrderItem = {
    id: "ord_" + Date.now().toString(36),
    customer_id: order.customer?.id || current?.id || "guest",
    customer_name: order.customer?.name || current?.name || "Mijoz",
    customer_phone: order.customer?.phone || current?.phone || "+998 90 000 00 00",
    product_name: order.product_name,
    product_id: order.product_id,
    category: order.category || "phone",
    price: order.price,
    status: "pending",
    status_label: "Ko'rib chiqilmoqda",
    created_at: new Date().toISOString(),
    archived: false,
  };
  const updated = [newOrder, ...all];
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  notifyListeners();
  return newOrder;
}

export function updateOrderStatus(orderId: string, status: OrderItem["status"]) {
  const labels: Record<string, string> = {
    pending: "Ko'rib chiqilmoqda",
    shipping: "Yo'lda (Yetkazilmoqda)",
    delivered: "Yetkazib berildi",
    cancelled: "Bekor qilindi",
  };
  const now = new Date().toISOString();
  const isArchived = status === "delivered" || status === "cancelled";

  const all = getAllOrders().map((o) =>
    o.id === orderId
      ? {
          ...o,
          status,
          status_label: labels[status] || status,
          archived: isArchived,
          delivered_at: status === "delivered" ? (o.delivered_at || now) : o.delivered_at,
        }
      : o
  );
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
  notifyListeners();
}

export function toggleOrderArchive(orderId: string, archived: boolean) {
  const all = getAllOrders().map((o) =>
    o.id === orderId ? { ...o, archived } : o
  );
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(all));
  notifyListeners();
}

// Helper to generate realistic initial trades
function createInitialTrades(): TradeItem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const hourMs = 60 * 60 * 1000;

  return [
    {
      id: "trd-201",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      model: "iPhone 11",
      memory: "128 GB",
      battery_range: "84%",
      offer_price: 3400000,
      status: "rated",
      status_label: "Baholandi",
      created_at: new Date(now - 3 * dayMs).toISOString(),
      rated_at: new Date(now - 2 * dayMs).toISOString(),
      archived: true,
    },
    {
      id: "trd-202",
      customer_id: "demo-user-2",
      customer_name: "Malika Yusupova",
      customer_phone: "+998 97 765 43 21",
      model: "Samsung Galaxy S21",
      memory: "128 GB",
      battery_range: "89%",
      offer_price: null,
      status: "pending",
      status_label: "Ko'rib chiqilmoqda",
      created_at: new Date(now - 2 * hourMs).toISOString(),
      archived: false,
    },
    {
      id: "trd-203",
      customer_id: "demo-user-1",
      customer_name: "Jasur Rahimov",
      customer_phone: "+998 90 123 45 67",
      model: "Redmi Note 12 Pro",
      memory: "256 GB",
      battery_range: "92%",
      offer_price: 2100000,
      status: "rated",
      status_label: "Baholandi",
      created_at: new Date(now - 7 * dayMs).toISOString(),
      rated_at: new Date(now - 6 * dayMs).toISOString(),
      archived: true,
    },
  ];
}

// Trades management
export function getAllTrades(): TradeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRADES);
    if (raw) {
      const parsed: TradeItem[] = JSON.parse(raw);
      if (parsed.length > 0 && typeof parsed[0].archived !== "undefined") {
        return parsed;
      }
    }
    const initial = createInitialTrades();
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

export function getUserTrades(userId?: string): TradeItem[] {
  const all = getAllTrades();
  if (!userId) return all;
  return all.filter((t) => t.customer_id === userId);
}

export function addTrade(trade: {
  model: string;
  memory: string;
  battery_range: string;
  customer?: { id: string; name: string; phone: string };
}): TradeItem {
  const current = getCurrentUser();
  const all = getAllTrades();
  const newTrade: TradeItem = {
    id: "trd_" + Date.now().toString(36),
    customer_id: trade.customer?.id || current?.id || "guest",
    customer_name: trade.customer?.name || current?.name || "Mijoz",
    customer_phone: trade.customer?.phone || current?.phone || "+998 90 000 00 00",
    model: trade.model,
    memory: trade.memory,
    battery_range: trade.battery_range,
    offer_price: null,
    status: "pending",
    status_label: "Ko'rib chiqilmoqda",
    created_at: new Date().toISOString(),
    archived: false,
  };
  const updated = [newTrade, ...all];
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(updated));
  notifyListeners();
  return newTrade;
}

export function updateTradeStatus(
  tradeId: string,
  status: "rated" | "rejected" | "pending",
  offerPrice?: number
) {
  const now = new Date().toISOString();
  const isArchived = status === "rated" || status === "rejected";

  const all = getAllTrades().map((t) => {
    if (t.id === tradeId) {
      return {
        ...t,
        status,
        offer_price: offerPrice ?? t.offer_price,
        status_label:
          status === "rated"
            ? "Baholandi"
            : status === "rejected"
            ? "Rad etildi"
            : "Ko'rib chiqilmoqda",
        archived: isArchived,
        rated_at: isArchived ? (t.rated_at || now) : undefined,
      };
    }
    return t;
  });
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(all));
  notifyListeners();
}

export function toggleTradeArchive(tradeId: string, archived: boolean) {
  const all = getAllTrades().map((t) =>
    t.id === tradeId ? { ...t, archived } : t
  );
  localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(all));
  notifyListeners();
}

/* =========================================================================
   SALES STATISTICS ENGINE (Kunlik, Haftalik, Oylik, Jami)
   ========================================================================= */
export type SalesPeriod = "day" | "week" | "month" | "all";

export type SalesStats = {
  period: SalesPeriod;
  periodLabel: string;
  totalRevenue: number;
  ordersCount: number;
  averageCheck: number;
  deliveredCount: number;
  phoneRevenue: number;
  partRevenue: number;
  accessoryRevenue: number;
  phoneCount: number;
  partCount: number;
  accessoryCount: number;
  deliveredOrders: OrderItem[];
};

export function getSalesStatistics(period: SalesPeriod = "day"): SalesStats {
  const allOrders = getAllOrders();
  const delivered = allOrders.filter((o) => o.status === "delivered");
  const now = new Date();

  const labels: Record<SalesPeriod, string> = {
    day: "Bugun (Kunlik)",
    week: "Ushbu hafta (Haftalik)",
    month: "Ushbu oy (Oylik)",
    all: "Barcha davr (Jami)",
  };

  const filtered = delivered.filter((o) => {
    const rawDate = o.delivered_at || o.created_at;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return false;

    if (period === "all") return true;

    if (period === "day") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }

    if (period === "week") {
      const diffMs = now.getTime() - d.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }

    if (period === "month") {
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }

    return true;
  });

  const totalRevenue = filtered.reduce((acc, o) => acc + (o.price || 0), 0);
  const ordersCount = filtered.length;
  const averageCheck = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

  let phoneRevenue = 0;
  let partRevenue = 0;
  let accessoryRevenue = 0;
  let phoneCount = 0;
  let partCount = 0;
  let accessoryCount = 0;

  filtered.forEach((o) => {
    const nameLower = (o.product_name || "").toLowerCase();
    const cat =
      o.category ||
      (nameLower.includes("adapter") ||
      nameLower.includes("airpods") ||
      nameLower.includes("g'ilof") ||
      nameLower.includes("case") ||
      nameLower.includes("kabel")
        ? "accessory"
        : nameLower.includes("displey") ||
          nameLower.includes("korpus") ||
          nameLower.includes("ekran") ||
          nameLower.includes("batareya")
        ? "part"
        : "phone");

    if (cat === "phone") {
      phoneRevenue += o.price || 0;
      phoneCount += 1;
    } else if (cat === "part") {
      partRevenue += o.price || 0;
      partCount += 1;
    } else {
      accessoryRevenue += o.price || 0;
      accessoryCount += 1;
    }
  });

  return {
    period,
    periodLabel: labels[period],
    totalRevenue,
    ordersCount,
    averageCheck,
    deliveredCount: ordersCount,
    phoneRevenue,
    partRevenue,
    accessoryRevenue,
    phoneCount,
    partCount,
    accessoryCount,
    deliveredOrders: filtered,
  };
}

// Chat management
export type ChatThread = {
  id: string; // customer user id or "guest"
  customer_name: string;
  customer_phone?: string;
  city?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastSender?: "customer" | "shop";
};

export function getRegisteredCustomers(): User[] {
  return getStoredUsers().filter((u) => u.role === "customer");
}

export function getAllChatThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  const customers = getRegisteredCustomers();
  const threadsMap = new Map<string, ChatThread>();

  // 1. Add all registered customers as threads
  customers.forEach((u) => {
    const chats = getUserChats(u.id);
    const last = chats.length > 0 ? chats[chats.length - 1] : undefined;
    threadsMap.set(u.id, {
      id: u.id,
      customer_name: u.name,
      customer_phone: u.phone,
      city: u.city,
      lastMessage: last?.text || "Mijoz ro'yxatdan o'tdi",
      lastMessageTime: last?.created_at || u.createdAt,
      lastSender: last?.sender,
    });
  });

  // 2. Check guest chat
  const guestChats = getUserChats("guest");
  if (guestChats.length > 0) {
    const last = guestChats[guestChats.length - 1];
    threadsMap.set("guest", {
      id: "guest",
      customer_name: "Mehmon (Tashrif buyuruvchi)",
      customer_phone: "Ro'yxatdan o'tmagan",
      city: "Aniqlanmagan",
      lastMessage: last.text,
      lastMessageTime: last.created_at,
      lastSender: last.sender,
    });
  }

  // 3. Scan localStorage keys for any other customer chats
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEYS.CHATS}_`)) {
        const id = key.replace(`${STORAGE_KEYS.CHATS}_`, "");
        if (!threadsMap.has(id) && id !== "user-admin") {
          const chats = getUserChats(id);
          const last = chats.length > 0 ? chats[chats.length - 1] : undefined;
          const userObj = getStoredUsers().find((u) => u.id === id);
          threadsMap.set(id, {
            id,
            customer_name: userObj?.name || `Mijoz #${id.slice(-4)}`,
            customer_phone: userObj?.phone || "Mijoz",
            city: userObj?.city,
            lastMessage: last?.text || "Xabarlar mavjud",
            lastMessageTime: last?.created_at || new Date().toISOString(),
            lastSender: last?.sender,
          });
        }
      }
    }
  } catch {
    // Ignore error
  }

  // Sort by latest message time descending
  return Array.from(threadsMap.values()).sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || 0).getTime();
    const timeB = new Date(b.lastMessageTime || 0).getTime();
    return timeB - timeA;
  });
}

export function getUserChats(userId: string): ChatItem[] {
  if (typeof window === "undefined") return [];
  try {
    // Check main key
    const raw = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${userId}`);
    if (raw) return JSON.parse(raw);

    // If guest, also check legacy key
    if (userId === "guest") {
      const legacyGuest = localStorage.getItem("ph_guest_chats");
      if (legacyGuest) {
        const parsed = JSON.parse(legacyGuest);
        localStorage.setItem(`${STORAGE_KEYS.CHATS}_guest`, legacyGuest);
        return parsed;
      }
    }

    const initial: ChatItem[] = [
      {
        id: "msg_init_" + userId,
        customer_id: userId,
        sender: "shop",
        text: "Assalomu alaykum! PhoneHub rasmiy do'koniga xush kelibsiz. Savollaringiz bo'lsa marhamat yozing.",
        created_at: new Date().toISOString(),
        delivered: true,
      },
    ];
    localStorage.setItem(`${STORAGE_KEYS.CHATS}_${userId}`, JSON.stringify(initial));
    return initial;
  } catch {
    return [];
  }
}

export function saveUserChats(userId: string, chats: ChatItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEYS.CHATS}_${userId}`, JSON.stringify(chats));
  if (userId === "guest") {
    localStorage.setItem("ph_guest_chats", JSON.stringify(chats));
  }
  notifyListeners();
}

export function addUserChatMessage(
  userId: string,
  sender: "customer" | "shop",
  text: string
): ChatItem {
  const current = getCurrentUser();
  const chats = getUserChats(userId);

  const users = getStoredUsers();
  const targetUser = users.find((u) => u.id === userId);
  const custName =
    userId === "guest"
      ? "Mehmon"
      : targetUser?.name || (current?.id === userId ? current?.name : undefined) || "Mijoz";

  const newMsg: ChatItem = {
    id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    customer_id: userId,
    customer_name: custName,
    sender,
    text,
    created_at: new Date().toISOString(),
    delivered: true,
  };
  const updated = [...chats, newMsg];
  saveUserChats(userId, updated);
  notifyListeners();
  return newMsg;
}

export function generateShopReply(userText: string, userName?: string): string {
  const lower = userText.toLowerCase();
  const nameGreet = userName ? ` ${userName}` : "";

  if (lower.includes("narx") || lower.includes("kelish") || lower.includes("arzon") || lower.includes("skidka") || lower.includes("chegirma")) {
    return `Assalomu alaykum${nameGreet}! Bizdagi narxlar bozorga nisbatan qulay qilib belgilangan. Agar 2 ta va undan ortiq mahsulot xarid qilsangiz yoki eski telefoningizni topshirsangiz (trade-in), chegirma qilib beramiz! 😊`;
  }
  if (lower.includes("yetkaz") || lower.includes("dostavka") || lower.includes("pochta") || lower.includes("fargo") || lower.includes("bts")) {
    return `Toshkent shahri bo'ylab yetkazib berish xizmati 2 soat ichida bepul! Viloyatlarga esa BTS pochta yoki Fargo orqali 24 soat ichida yetkaziladi.`;
  }
  if (lower.includes("kafolat") || lower.includes("garantiya") || lower.includes("tekshir")) {
    return `Barcha ikkinchi qo'l telefonlarimiz mutaxassislar tomonidan to'liq tekshirilgan. Har bir telefonga 3 oylik rasmiy kafolat beramiz!`;
  }
  if (lower.includes("original") || lower.includes("zavod") || lower.includes("ochilmagan") || lower.includes("almashtirilmagan")) {
    return `Barcha telefonlarimiz va aksessuarlarimiz 100% original. IMEI kodi va batareya holatini o'zingiz ham tekshirib olishingiz mumkin.`;
  }
  if (lower.includes("trade") || lower.includes("almashtir") || lower.includes("bahola") || lower.includes("sotmoqchi")) {
    return `Albatta! 'Baholash' bo'limida telefoningiz modeli, xotirasi va batareya foizini kiritib ariza qoldiring. Biz 5 daqiqada narx taklifini beramiz.`;
  }
  if (lower.includes("salom") || lower.includes("assalomu")) {
    return `Vaalaykum assalom${nameGreet}! PhoneHub do'koniga xush kelibsiz. Qaysi model yoki mahsulot sizni qiziqtiryapti?`;
  }
  return `Xabaringiz uchun rahmat${nameGreet}! Mutaxassisimiz tez orada siz bilan bog'lanadi. Shuningdek +998 71 200-00-00 raqamiga ham qo'ng'iroq qilishingiz mumkin.`;
}

// Products Store (Local sync for Admin add/delete/toggle)
export function getAllProducts(): ProductItem[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: ProductItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyListeners();
}

export function addProduct(p: Omit<ProductItem, "id" | "created_at">): ProductItem {
  const all = getAllProducts();
  const newProduct: ProductItem = {
    ...p,
    id: "p_" + Date.now().toString(36),
    created_at: new Date().toISOString(),
  };
  saveProducts([newProduct, ...all]);
  return newProduct;
}

export function updateProduct(id: string, updated: Partial<ProductItem>): ProductItem | null {
  const all = getAllProducts();
  const index = all.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const newProduct: ProductItem = {
    ...all[index],
    ...updated,
  };
  all[index] = newProduct;
  saveProducts(all);
  return newProduct;
}

export function toggleProductStatus(id: string) {
  const all = getAllProducts().map((p) =>
    p.id === id ? { ...p, status: p.status === "active" ? ("sold" as const) : ("active" as const) } : p
  );
  saveProducts(all);
}

export function deleteProduct(id: string) {
  const all = getAllProducts().filter((p) => p.id !== id);
  saveProducts(all);
}

// Reactive Hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    const check = () => setUser(getCurrentUser());
    window.addEventListener("ph-auth-change", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("ph-auth-change", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isSeller: false,
    isAdminOrSeller: user?.role === "admin",
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    loginAsRole,
    updateProfile: updateUserProfile,
  };
}
