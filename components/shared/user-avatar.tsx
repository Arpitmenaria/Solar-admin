import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}

const SIZE_MAP = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-xl",
  xl: "h-24 w-24 text-2xl",
};

export function UserAvatar({ src, name, size = "md", className, online }: UserAvatarProps) {
  const initials = getInitials(name);
  return (
    <div className={cn("relative shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden", SIZE_MAP[size])}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-[#1a2a4a] font-semibold text-[#3b82f6]", SIZE_MAP[size])}>
            {initials}
          </div>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#080c16]",
            online ? "bg-emerald-400" : "bg-[#3a4a6a]"
          )}
        />
      )}
    </div>
  );
}
