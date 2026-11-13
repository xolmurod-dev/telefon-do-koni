import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, Calculator, MessageCircle, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Bosh", icon: Home },
  { to: "/katalog", label: "Katalog", icon: LayoutGrid },
  { to: "/baholash", label: "Baholash", icon: Calculator },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-lg">
      <div className="mx-auto grid max-w-lg grid-cols-5 pt-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group flex flex-col items-center gap-1 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    isActive ? "bg-accent text-accent-foreground" : "group-hover:bg-accent/20"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function PageHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-background/90 px-4 pb-3 pt-4 backdrop-blur-lg">
      <h1 className="text-2xl font-bold">{title}</h1>
      {right}
    </header>
  );
}
