import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { BottomNav } from "@/components/shop/BottomNav";
import { AuthModal } from "@/components/shop/AuthModal";
import { Toaster } from "@/components/ui/sonner";
import { useAuth, openAuthModal } from "@/lib/auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    // Error logged in console
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "PhoneHub — ikkinchi qo'l telefonlar" },
      { name: "description", content: "Ikkinchi qo'l telefonlar, ehtiyot qismlar va aksessuarlar do'koni." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#1f2430" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Shell />
      <AuthModal />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

function Shell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  const { isAuthenticated } = useAuth();

  if (isAdmin) return <Outlet />;

  const handleInterceptClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      openAuthModal("register", "Ilovadan to'liq foydalanish uchun avval ro'yxatdan o'ting!");
    }
  };

  const handleInterceptKeyDown = (e: React.KeyboardEvent) => {
    if (!isAuthenticated && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      e.stopPropagation();
      openAuthModal("register", "Ilovadan to'liq foydalanish uchun avval ro'yxatdan o'ting!");
    }
  };

  return (
    <div
      onClickCapture={handleInterceptClick}
      onKeyDownCapture={handleInterceptKeyDown}
      className="mx-auto min-h-screen max-w-lg pb-28"
    >
      {!isAuthenticated && (
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-md">
          <p className="text-[11px] font-semibold text-foreground">
            🔒 Saytdan to'liq foydalanish uchun ro'yxatdan o'ting
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("register", "Ilovadan foydalanish uchun ro'yxatdan o'ting")}
            className="rounded-xl bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-xs hover:opacity-90 active:scale-95"
          >
            Ro'yxatdan o'tish
          </button>
        </div>
      )}
      <Outlet />
      <BottomNav />
    </div>
  );
}
