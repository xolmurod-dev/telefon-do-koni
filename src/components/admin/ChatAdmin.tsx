import { useEffect, useRef, useState } from "react";
import { ChevronLeft, SendHorizontal } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminReply } from "@/lib/shop.functions";

type Thread = { id: string; customer_id: string; last_text: string | null; last_message_at: string; customers: { name: string | null; phone: string | null } | null; unread: number };
type Msg = { id: string; sender: string; text: string; created_at: string };

export function ChatAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const activeRef = useRef<Thread | null>(null);
  activeRef.current = active;

  const loadThreads = async () => {
    const { data } = await supabase.from("chat_threads").select("id,customer_id,last_text,last_message_at,customers(name,phone)").order("last_message_at", { ascending: false });
    const { data: unread } = await supabase.from("chat_messages").select("thread_id").eq("sender", "customer").is("read_at", null);
    const counts = new Map<string, number>();
    (unread ?? []).forEach((u) => counts.set(u.thread_id, (counts.get(u.thread_id) ?? 0) + 1));
    setThreads((data ?? []).map((t) => ({ ...(t as unknown as Thread), unread: counts.get(t.id) ?? 0 })));
  };
  const loadMsgs = async (t: Thread) => {
    const { data } = await supabase.from("chat_messages").select("id,sender,text,created_at").eq("thread_id", t.id).order("created_at");
    setMsgs(data ?? []);
    await supabase.from("chat_messages").update({ read_at: new Date().toISOString() }).eq("thread_id", t.id).eq("sender", "customer").is("read_at", null);
  };

  useEffect(() => {
    loadThreads();
    const ch = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => {
        const m = p.new as Msg & { thread_id: string };
        if (activeRef.current?.id === m.thread_id) loadMsgs(activeRef.current);
        loadThreads();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  useEffect(() => { if (active) loadMsgs(active).then(loadThreads); }, [active?.id]);
  useEffect(() => { end.current?.scrollIntoView(); }, [msgs.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !text.trim()) return;
    try { await adminReply({ data: { customerId: active.customer_id, text: text.trim() } }); setText(""); } catch { toast.error("Yuborilmadi"); }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <div className={`${active ? "hidden md:block" : ""} space-y-2`}>
        <h2 className="mb-1 text-xl font-bold">Suhbatlar</h2>
        {threads.length === 0 && <p className="text-muted-foreground">Hozircha suhbat yo'q.</p>}
        {threads.map((t) => (
          <button key={t.id} onClick={() => setActive(t)} className={`w-full rounded-2xl border p-3 text-left ${active?.id === t.id ? "bg-accent text-accent-foreground" : "bg-card"}`}>
            <div className="flex justify-between gap-2">
              <p className="truncate font-semibold">{t.customers?.name || "Mijoz"}</p>
              {t.unread > 0 && <span className="rounded-full bg-destructive px-2 text-xs font-bold text-destructive-foreground">{t.unread}</span>}
            </div>
            <p className="truncate text-xs opacity-70">{t.last_text}</p>
          </button>
        ))}
      </div>
      {active ? (
        <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border bg-card">
          <div className="flex items-center gap-2 border-b p-3">
            <button onClick={() => setActive(null)} className="md:hidden" aria-label="Orqaga"><ChevronLeft /></button>
            <div><p className="font-semibold">{active.customers?.name || "Mijoz"}</p>{active.customers?.phone && <a href={`tel:${active.customers.phone}`} className="text-xs underline">{active.customers.phone}</a>}</div>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : ""}`}>
                <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {m.text}<p className="mt-1 text-right text-[10px] opacity-60">{new Date(m.created_at).toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</p>
                </div>
              </div>
            ))}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Javob yozing..." className="h-11 flex-1 rounded-full border bg-background px-4 text-sm outline-none" />
            <button aria-label="Yuborish" className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><SendHorizontal className="h-5 w-5" /></button>
          </form>
        </div>
      ) : (
        <div className="hidden items-center justify-center rounded-2xl border text-muted-foreground md:flex">Suhbatni tanlang</div>
      )}
    </div>
  );
}
