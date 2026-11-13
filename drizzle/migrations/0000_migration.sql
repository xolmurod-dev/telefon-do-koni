create type public.app_role as enum ('admin');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('phone','part','accessory')),
  subcategory text, name text not null, brand text not null default '', price bigint not null default 0,
  ram text, rom text, condition text, color text, battery_health int, repaired boolean not null default false,
  compatible_models text, description text, imei text, images text[] not null default '{}',
  status text not null default 'active' check (status in ('active','sold')), created_at timestamptz not null default now());
grant select on public.products to anon, authenticated; grant insert, update, delete on public.products to authenticated; grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "public active" on public.products for select to anon, authenticated using (status='active' or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.customers (id uuid primary key default gen_random_uuid(), token text not null unique, name text, phone text, created_at timestamptz not null default now());
create table public.orders (id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade, product_id uuid references public.products(id) on delete set null, product_name text not null, price bigint not null default 0, name text not null, phone text not null, status text not null default 'new', created_at timestamptz not null default now());
create table public.trade_requests (id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade, model text not null, memory text not null, defects text, tech_state text, battery_range text not null, images text[] not null default '{}', name text not null, phone text not null, offer_price bigint, status text not null default 'pending' check (status in ('pending','rated','rejected')), created_at timestamptz not null default now());
create table public.chat_threads (id uuid primary key default gen_random_uuid(), customer_id uuid not null unique references public.customers(id) on delete cascade, last_message_at timestamptz not null default now(), last_text text);
create table public.chat_messages (id uuid primary key default gen_random_uuid(), thread_id uuid not null references public.chat_threads(id) on delete cascade, sender text not null check (sender in ('customer','admin')), text text not null, product_id uuid, read_at timestamptz, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['customers','orders','trade_requests','chat_threads','chat_messages'] loop
    execute format('grant select, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.has_role(auth.uid(),''admin'')) with check (public.has_role(auth.uid(),''admin''))', t);
  end loop; end $$;
grant insert on public.chat_messages to authenticated;

alter publication supabase_realtime add table public.chat_messages, public.chat_threads, public.orders, public.trade_requests;

create policy "admin upload" on storage.objects for insert to authenticated with check (bucket_id='uploads' and public.has_role(auth.uid(),'admin'));
create policy "admin read" on storage.objects for select to authenticated using (bucket_id='uploads' and public.has_role(auth.uid(),'admin'));
create policy "admin delete" on storage.objects for delete to authenticated using (bucket_id='uploads' and public.has_role(auth.uid(),'admin'));

insert into public.products (category, subcategory, name, brand, price, ram, rom, condition, color, battery_health, repaired, description) values
('phone',null,'iPhone 13 Pro','Apple',7200000,'6','256','Ideal','Sierra Blue',89,false,'Original, quti va kabel bilan.'),
('phone',null,'iPhone 11','Apple',3900000,'4','128','Yaxshi','Qora',82,false,'Kichik tirnalishlar bor.'),
('phone',null,'Galaxy S22 Ultra','Samsung',6500000,'12','256','Yaxshi','Burgundy',90,false,'S Pen bilan.'),
('phone',null,'Redmi Note 12 Pro','Xiaomi',2400000,'8','256','Ideal','Ko''k',95,false,'Deyarli yangi.'),
('phone',null,'Galaxy A54','Samsung',2900000,'8','128','O''rta','Oq',80,true,'Ekrani almashtirilgan.');
insert into public.products (category, subcategory, name, brand, price, compatible_models, condition, description) values
('part','Displey','iPhone 11 OLED displey','Apple',650000,'iPhone 11 / XR','Ideal','Original sifat.'),
('part','Akkumulyator','iPhone X akkumulyator','Apple',250000,'iPhone X','Ideal','3000 mAh.'),
('part','Kamera','Galaxy S21 asosiy kamera','Samsung',400000,'Galaxy S21 / S21+','Yaxshi',null),
('accessory','Himoya oynasi','9D himoya oynasi','Universal',40000,'iPhone 12 / 13 / 14',null,null),
('accessory','G''ilof','Silikon g''ilof MagSafe','Apple',120000,'iPhone 13 / 14',null,null),
('accessory','Zaryadlash bloki','20W tez zaryadlash bloki','Apple',150000,null,null,null),
('accessory','Quloqchin','AirPods Pro 2 (nusxa)','Apple',350000,null,null,null);