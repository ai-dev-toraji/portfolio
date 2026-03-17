type WorksCardProps = {
  title: string;
  category: string;
};

export default function WorksCard({ title, category }: WorksCardProps) {
  return (
    <div className="relative group overflow-hidden bg-[#C8C8C8] aspect-[4/3] cursor-pointer">
      {/* Placeholder image area */}
      <div className="w-full h-full bg-[#C8C8C8] flex items-center justify-center">
        <span className="text-white/40 text-sm tracking-widest">{title}</span>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-(--color-primary)/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
        <p className="text-white text-lg font-bold tracking-widest">{title}</p>
        <p className="text-(--color-accent) text-xs tracking-widest uppercase">{category}</p>
      </div>

      {/* Grid border accent */}
      <div className="absolute inset-0 border border-[#6B8FC4]/40 pointer-events-none" />
    </div>
  );
}
