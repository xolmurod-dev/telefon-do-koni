import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tokenSchema = z.string().min(20).max(80);
const clean = (s: string) => s.replace(/[<>]/g, "").trim();

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function signPaths(paths: string[]) {
  if (!paths.length) return [];
  const sb = await admin();
  const { data } = await sb.storage.from("uploads").createSignedUrls(paths, 60 * 60 * 24);
  return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
}

async function notifyTelegram(text: string) {
  const bot = process.env["TELEGRAM_BOT_TOKEN"];
  const chat = process.env["TELEGRAM_CHAT_ID"];
  if (!bot || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text }),
    });
  } catch (e) {
    console.error("telegram", e);
  }
}

async function getCustomer(token: string, name?: string, phone?: string) {
  const sb = await admin();
  const { data: existing } = await sb.from("customers").select("*").eq("token", token).maybeSingle();
  if (existing) {
    if ((name && name !== existing.name) || (phone && phone !== existing.phone)) {
      await sb.from("customers").update({ name: name ?? existing.name, phone: phone ?? existing.phone }).eq("id", existing.id);
    }
    return existing;
  }
  const { data, error } = await sb.from("customers").insert({ token, name: name ?? null, phone: phone ?? null }).select().single();
  if (error) throw new Error("Mijoz yaratilmadi");
  return data;
}

async function getThread(customerId: string) {
  const sb = await admin();
  const { data } = await sb.from("chat_threads").select("*").eq("customer_id", customerId).maybeSingle();
  if (data) return data;
  const { data: t, error } = await sb.from("chat_threads").insert({ customer_id: customerId }).select().single();
  if (error) throw new Error("Chat yaratilmadi");
  return t;
}

async function postMessage(customerId: string, sender: "customer" | "admin", text: string, productId?: string | null) {
  const sb = await admin();
  const thread = await getThread(customerId);
  await sb.from("chat_messages").insert({ thread_id: thread.id, sender, text, product_id: productId ?? null });
  await sb.from("chat_threads").update({ last_message_at: new Date().toISOString(), last_text: text.slice(0, 120) }).eq("id", thread.id);
}

// ---------- Public catalog ----------
export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: { category?: string; aksiya?: boolean }) =>
    z.object({ category: z.string().optional(), aksiya: z.boolean().optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const sb = await admin();
      let q = sb
        .from("products")
        .select("id,category,subcategory,name,brand,price,ram,rom,condition,color,battery_health,repaired,compatible_models,images,created_at,is_aksiya")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (data.aksiya) {
        q = q.eq("is_aksiya", true);
      } else if (data.category) {
        q = q.eq("category", data.category);
      }
      const { data: rows, error } = await q;
      if (error || !rows) return [];
      const firsts = rows.map((r) => r.images[0]).filter((x): x is string => !!x);
      const urls = await signPaths(firsts);
      const map = new Map(firsts.map((p, i) => [p, urls[i]]));
      return rows.map((r) => ({ ...r, cover: r.images[0] ? map.get(r.images[0]) ?? null : null }));
    } catch (err) {
      console.warn("listProducts fallback", err);
      return [];
    }
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
      if (!isUuid) return null;
      const sb = await admin();
      const { data: p, error } = await sb.from("products").select("*").eq("id", data.id).eq("status", "active").maybeSingle();
      if (error || !p) return null;
      const imageUrls = await signPaths(p.images);
      const imei = p.imei ? `${p.imei.slice(0, 4)}••••••${p.imei.slice(-3)}` : null;
      return { ...p, imei, imageUrls };
    } catch (err) {
      console.warn("getProduct fallback", err);
      return null;
    }
  });

// ---------- Customer ----------
export const saveProfile = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; name: string; phone: string }) =>
    z.object({ token: tokenSchema, name: z.string().max(80), phone: z.string().max(30) }).parse(d),
  )
  .handler(async ({ data }) => {
    await getCustomer(data.token, clean(data.name), clean(data.phone));
    return { ok: true };
  });

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; productId: string; name: string; phone: string }) =>
    z.object({ token: tokenSchema, productId: z.string(), name: z.string().min(2).max(80), phone: z.string().min(7).max(30) }).parse(d),
  )
  .handler(async ({ data }) => {
    try {
      const sb = await admin();
      const name = clean(data.name), phone = clean(data.phone);
      const c = await getCustomer(data.token, name, phone);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.productId);
      let pName = "Mahsulot";
      let pPrice = 0;
      let pCat = "phone";
      if (isUuid) {
        const { data: p } = await sb.from("products").select("id,name,price,category").eq("id", data.productId).eq("status", "active").maybeSingle();
        if (p) {
          pName = p.name;
          pPrice = p.price;
          pCat = p.category;
          await sb.from("orders").insert({ customer_id: c.id, product_id: p.id, product_name: p.name, price: p.price, name, phone });
        }
      }
      const verb = pCat === "phone" ? "band qilmoqchiman" : "buyurtma bermoqchiman";
      const text = `🛒 ${pName} — ${pPrice.toLocaleString("ru-RU")} so'm\nMen ushbu mahsulotni ${verb}.\nIsm: ${name}\nTel: ${phone}`;
      await postMessage(c.id, "customer", text, isUuid ? data.productId : null);
      await notifyTelegram(`Yangi buyurtma!\n${text}`);
      return { ok: true };
    } catch (err) {
      console.warn("createOrder fallback", err);
      return { ok: true };
    }
  });

export const createTrade = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        token: tokenSchema,
        model: z.string().min(2).max(80),
        memory: z.string().min(2).max(20),
        defects: z.string().max(1000).optional(),
        techState: z.string().max(1000).optional(),
        battery: z.string().min(2).max(30),
        name: z.string().min(2).max(80),
        phone: z.string().min(7).max(30),
        images: z.array(z.string().max(7_000_000)).max(3),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const name = clean(data.name), phone = clean(data.phone);
    const c = await getCustomer(data.token, name, phone);
    const paths: string[] = [];
    for (const img of data.images) {
      const m = img.match(/^data:(image\/(webp|jpeg|png));base64,(.+)$/);
      if (!m) continue;
      const bytes = Uint8Array.from(atob(m[3]!), (ch) => ch.charCodeAt(0));
      if (bytes.length > 5 * 1024 * 1024) continue;
      const path = `trade/${c.id}/${crypto.randomUUID()}.${m[2] === "jpeg" ? "jpg" : m[2]}`;
      const { error } = await sb.storage.from("uploads").upload(path, bytes, { contentType: m[1]! });
      if (!error) paths.push(path);
    }
    await sb.from("trade_requests").insert({
      customer_id: c.id, model: clean(data.model), memory: data.memory, defects: data.defects ? clean(data.defects) : null,
      tech_state: data.techState ? clean(data.techState) : null, battery_range: data.battery, images: paths, name, phone,
    });
    const text = `📱 Baholash arizasi: ${clean(data.model)}, ${data.memory}, batareya ${data.battery}. Narx taklifini kutyapman.`;
    await postMessage(c.id, "customer", text);
    await notifyTelegram(`Yangi baholash arizasi!\n${text}\nIsm: ${name}\nTel: ${phone}`);
    return { ok: true };
  });

export const getChat = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: c } = await sb.from("customers").select("id").eq("token", data.token).maybeSingle();
    if (!c) return [];
    const { data: t } = await sb.from("chat_threads").select("id").eq("customer_id", c.id).maybeSingle();
    if (!t) return [];
    const { data: msgs } = await sb.from("chat_messages").select("id,sender,text,created_at").eq("thread_id", t.id).order("created_at");
    return msgs ?? [];
  });

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string; text: string }) => z.object({ token: tokenSchema, text: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data }) => {
    const c = await getCustomer(data.token);
    const text = clean(data.text);
    await postMessage(c.id, "customer", text);
    await notifyTelegram(`💬 ${c.name ?? "Mijoz"}: ${text}`);
    return { ok: true };
  });

export const myHistory = createServerFn({ method: "POST" })
  .inputValidator((d: { token: string }) => z.object({ token: tokenSchema }).parse(d))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: c } = await sb.from("customers").select("id").eq("token", data.token).maybeSingle();
    if (!c) return { orders: [], trades: [] };
    const [{ data: orders }, { data: trades }] = await Promise.all([
      sb.from("orders").select("id,product_name,price,status,created_at").eq("customer_id", c.id).order("created_at", { ascending: false }),
      sb.from("trade_requests").select("id,model,memory,battery_range,offer_price,status,created_at").eq("customer_id", c.id).order("created_at", { ascending: false }),
    ]);
    return { orders: orders ?? [], trades: trades ?? [] };
  });

// ---------- Admin ----------
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (isAdmin) return { admin: true };
    const sb = await admin();
    const { count } = await sb.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) return { admin: false };
    await sb.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    return { admin: true };
  });

export const adminReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { customerId: string; text: string }) => z.object({ customerId: z.string().uuid(), text: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Ruxsat yo'q");
    await postMessage(data.customerId, "admin", clean(data.text));
    return { ok: true };
  });
