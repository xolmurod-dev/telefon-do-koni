import { cn } from "@/lib/utils";

export function ProductArt({ category, src, className }: { category: string; src?: string | null; className?: string }) {
  if (src) return <img src={src} alt="" loading="lazy" className={cn("h-full w-full object-cover", className)} />;
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-secondary", className)}>
      <svg viewBox="0 0 100 100" className="h-3/5 w-3/5 text-foreground/80" fill="none" stroke="currentColor" strokeWidth="3">
        {category === "phone" && (
          <>
            <rect x="30" y="10" width="40" height="80" rx="8" />
            <rect x="34" y="18" width="32" height="60" rx="3" className="fill-accent" stroke="none" />
            <circle cx="50" cy="84" r="2.5" fill="currentColor" />
          </>
        )}
        {category === "part" && (
          <>
            <rect x="20" y="30" width="60" height="40" rx="4" />
            <path d="M30 30v-8M42 30v-8M58 30v-8M70 30v-8M30 70v8M42 70v8M58 70v8M70 70v8" />
            <rect x="38" y="40" width="24" height="20" rx="2" className="fill-accent" stroke="none" />
          </>
        )}
        {category === "accessory" && (
          <>
            <path d="M30 20h40v24a20 20 0 0 1-40 0z" className="fill-accent" />
            <path d="M42 64v12M58 64v12M36 76h28" />
            <path d="M50 76v12" />
          </>
        )}
      </svg>
    </div>
  );
}
