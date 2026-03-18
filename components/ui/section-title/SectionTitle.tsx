type SectionTitleColor = "primary" | "accent";

type SectionTitleProps = {
  children: React.ReactNode;
  color?: SectionTitleColor;
  as?: "h1" | "h2";
};

export default function SectionTitle({ children, color = "primary", as: Tag = "h2" }: SectionTitleProps) {
  const colorClass: Record<SectionTitleColor, string> = {
    primary: "text-(--color-primary)",
    accent: "text-(--color-accent)",
  };

  return (
    <Tag className={`text-center ${colorClass[color]} text-4xl md:text-5xl font-black tracking-[0.1em] mb-16`}>
      {children}
    </Tag>
  );
}
