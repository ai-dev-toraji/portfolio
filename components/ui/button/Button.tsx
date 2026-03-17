import Link from "next/link";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
};

export default function Button({ href, children, variant = "primary" }: ButtonProps) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      "text-white bg-(--color-primary) border border-(--color-primary) hover:bg-white hover:text-(--color-primary)",
    secondary:
      "text-(--color-primary) bg-white border border-(--color-primary) hover:bg-(--color-primary) hover:text-white hover:border-white",
  };

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-4 text-sm tracking-[0.3em] px-10 py-4 transition-all duration-300 group ${variantClasses[variant]}`}
    >
      {children}
      <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">
        &#8594;
      </span>
    </Link>
  );
}
