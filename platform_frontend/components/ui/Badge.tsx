interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantClasses = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]}`}>
      {label}
    </span>
  );
}

export function statusVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "published": return "success";
    case "draft": return "warning";
    case "archived": return "danger";
    default: return "default";
  }
}
