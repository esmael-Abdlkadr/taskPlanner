import { cn } from "../../lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Avatar = ({ src, name, size = "md", className }: AvatarProps) => {
  // Create initials from name
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Determine size class
  const sizeClass = {
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