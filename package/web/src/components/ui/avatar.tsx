interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export function Avatar({ name, size = "md", active = false }: AvatarProps) {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .substring(0, 2);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const colorClasses = active
    ? "bg-blue-600 text-white"
    : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";

  return (
    <div
      className={`flex justify-center items-center rounded-xl transition-all duration-200 ${sizeClasses[size]} ${colorClasses}`}
    >
      {initials}
    </div>
  );
}
