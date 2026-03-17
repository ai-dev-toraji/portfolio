type ServiceCardProps = {
  title: string;
  description: string;
  isLast?: boolean;
};

export default function ServiceCard({ title, description, isLast = false }: ServiceCardProps) {
  return (
    <div
      className={`bg-[#D8DFE8] p-8 md:p-10 flex flex-col gap-4 ${
        !isLast ? "border-b md:border-b-0 md:border-r border-(--color-primary)/20" : ""
      }`}
    >
      <h3 className="text-(--color-accent) text-lg font-bold tracking-wide border-b border-(--color-primary)/20 pb-4">
        {title}
      </h3>
      <p className="text-[#1a1a1a]/70 text-sm leading-loose tracking-wide">
        {description}
      </p>
    </div>
  );
}
