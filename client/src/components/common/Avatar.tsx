import { cn } from "../../lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xxs" | "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = ({ src, name, size = "md", className }: AvatarProps) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = {
    xxs: "w-4 h-4 text-[8px]",
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return src ? (
    <div
      className={cn(
        "rounded-full bg-gray-200 overflow-hidden flex items-center justify-center",
        sizeClass[size],
        className
      )}
    >
      <img src={src} alt={name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div
      className={cn(
        "rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium",
        sizeClass[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
