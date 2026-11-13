import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  SendHorizontal,
  Store,
  PhoneCall,
  CheckCheck,
  Sparkles,
  RotateCcw,
  ChevronDown,
  BookOpen,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAuth,
  getUserChats,
  addUserChatMessage,
  generateShopReply,
  saveUserChats,
  openAuthModal,
  ChatItem,
} from "@/lib/auth";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — PhoneHub" },
      { name: "description", content: "Do'kon mutaxassisi bilan onlayn yozishing — 1 daqiqada javob beramiz." },
      { property: "og:title", content: "Chat — PhoneHub" },
      { property: "og:description", content: "Savollaringizni yozing — mutaxassislarimiz onlayn." },
    ],
  }),
  component: ChatPage,
});

const CATALOG_QUESTIONS = [
  { emoji: "💰", text: "Narxi kelishiladimi?", category: "Narx va chegirmalar" },
  { emoji: "🚚", text: "Yetkazib berish qancha vaqt oladi?", category: "Dostavka" },
  { emoji: "🛡️", text: "Kafolat muddati qancha?", category: "Kafolat" },
  { emoji: "🔄", text: "Trade-in (eski telefonni yangisiga almashtirish) bormi?", category: "Trade-in" },
  { emoji: "💳", text: "Muddatli to'lov yoki bo'lib to'lash imkoni bormi?", category: "To'lov" },
  { emoji: "📱", text: "Barcha telefonlar 100% originalmi?", category: "Sifat va tekshiruv" },
  { emoji: "🔋", text: "Batareya holati qanday tekshirilgan?", category: "Holati" },
  { emoji: "📍", text: "Do'kon manzili va ish vaqti qanday?", category: "Manzil" },
];

const GUEST_STORAGE_KEY = "ph_guest_chats";

function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const activeChatId = user?.id || "guest";

  // Load and sync chat messages in real time
  useEffect(() => {
    const sync = () => {
      setMessages(getUserChats(user?.id || "guest"));
    };
    sync();

    window.addEventListener("ph-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ph-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping]);

  const handleSend = async (msgText: string) => {
    if (!msgText.trim() || busy) return;
    const cleanText = msgText.trim();
    setText("");
    setBusy(true);
    setCatalogOpen(false);

    try {
      // Send customer message (instantly notifies admin panel via ph-auth-change)
      addUserChatMessage(activeChatId, "customer", cleanText);

      // Auto-reply assistant if admin has not answered yet
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const replyText = generateShopReply(cleanText, user?.name || "Hurmatli mijoz");
        addUserChatMessage(activeChatId, "shop", replyText);
        setBusy(false);
      }, 1200);
    } catch {
      toast.error("Xabar yuborishda xatolik");
      setBusy(false);
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    const welcome: ChatItem[] = [
      {
        id: "msg_reset_" + Date.now(),
        customer_id: activeChatId,
        customer_name: user?.name || "Mehmon",
        sender: "shop",
        text: "Assalomu alaykum! Yangi suhbat boshlandi. Qanday savolingiz bor?",
        created_at: new Date().toISOString(),
        delivered: true,
      },
    ];
    saveUserChats(activeChatId, welcome);
    toast.success("Suhbat yangilandi");
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Store className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display text-sm font-bold">PhoneHub do'koni</p>
              <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] font-bold text-accent-foreground">
                Rasmiy
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              🟢 Onlayn • Odatda 1 daqiqada javob beradi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal("register", "Do'kon bilan to'liq bog'lanish uchun ro'yxatdan o'ting")}
              className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Ro'yxatdan o'tish</span>
            </button>
          )}

          <button
            onClick={handleResetChat}
            title="Suhbatni yangilash"
            className="flex h-9 w-9 items-center justify-center rounded-full border bg-card text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <a
            href="tel:+998712000000"
            title="Qo'ng'iroq qilish"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/20"
          >
            <PhoneCall className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Unregistered notification banner */}
      {!user && (
        <div className="flex items-center justify-between gap-3 border-b border-accent/30 bg-accent/15 px-4 py-2.5">
          <p className="text-xs font-medium text-foreground">
            👋 Siz mehmon rejimidasiz. Buyurtma berish uchun ro'yxatdan o'ting.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("register", "Ilovadan to'liq foydalanish uchun ro'yxatdan o'ting")}
            className="shrink-0 rounded-xl bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95"
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 space-y-3 px-4 py-4">
        <div className="my-2 rounded-2xl border border-border bg-card/60 p-3 text-center text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">PhoneHub qo'llab-quvvatlash xizmati</p>
          <p className="mt-0.5 text-[11px]">
            Telefonlar holati, narxlar, yetkazib berish va kafolat bo'yicha har qanday savolingizni bering.
          </p>
        </div>

        {messages.map((m) => {
          const isMe = m.sender === "customer";
          const time = new Date(m.created_at).toLocaleTimeString("uz", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1 duration-200`}
            >
              <div
                className={`max-w-[82%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? "rounded-br-sm bg-primary text-primary-foreground font-medium"
                    : "rounded-bl-sm border border-border bg-card text-card-foreground"
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                    isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  <span>{time}</span>
                  {isMe && <CheckCheck className="h-3 w-3" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
              <span className="text-xs text-muted-foreground font-medium">PhoneHub yozmoqda</span>
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* SMS Input Area with Questions Catalog */}
      <div className="sticky bottom-16 z-20 border-t bg-background/95 px-4 pb-3 pt-2.5 backdrop-blur-md">
        {/* Expandable Questions Catalog (ustini bosa ochiladigan katalog) */}
        {catalogOpen && (
          <div className="mb-2.5 rounded-3xl border border-border bg-card p-3 shadow-xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="mb-2 flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Savollar katalogi</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {CATALOG_QUESTIONS.length} ta savol
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCatalogOpen(false)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1 thin-scrollbar">
              {CATALOG_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={busy}
                  onClick={() => handleSend(`${q.emoji} ${q.text}`)}
                  className="group flex w-full items-center gap-2.5 rounded-2xl border border-border/50 bg-secondary/30 p-2 text-left transition-all hover:bg-secondary hover:border-primary/40 active:scale-[0.98]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card text-base shadow-xs group-hover:scale-105 transition-transform">
                    {q.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{q.text}</p>
                    <p className="text-[10px] text-muted-foreground">{q.category}</p>
                  </div>
                  <SendHorizontal className="h-3.5 w-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SMS yozadigan joy (Message input field + Catalog Button) */}
        <div className="flex items-center gap-2">
          {/* Button to open questions catalog */}
          <button
            type="button"
            onClick={() => setCatalogOpen(!catalogOpen)}
            title="Savollar katalogini ochish"
            className={`flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-all active:scale-95 ${
              catalogOpen
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Katalog</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${catalogOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(text);
            }}
            className="flex flex-1 items-center gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={2000}
              placeholder="Esemez / xabar yozing..."
              className="h-12 flex-1 rounded-2xl border bg-card px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={busy || !text.trim()}
              aria-label="Xabar yuborish"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-95 disabled:opacity-40"
            >
              <SendHorizontal className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
