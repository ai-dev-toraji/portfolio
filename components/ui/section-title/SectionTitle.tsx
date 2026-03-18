type SectionTitleColor = "primary" | "accent";

type SectionTitleProps = {
  children: React.ReactNode;
  color?: SectionTitleColor;
};

export default function SectionTitle({ children, color = "primary" }: SectionTitleProps) {
  const colorClass: Record<SectionTitleColor, string> = {
    primary: "text-(--color-primary)",
    accent: "text-(--color-accent)",
  };

  return (
    <h2 className={`text-center ${colorClass[color]} text-4xl md:text-5xl font-black tracking-[0.1em] mb-16`}>
      {children}
    </h2>
  );
}
