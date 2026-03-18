type WorksCardProps = {
  title: string;
  tags: string[];
  categories: string[];
};

export default function WorksCard({ title, tags, categories }: WorksCardProps) {
  return (
    <div className="cursor-pointer group">
      <div className="aspect-[4/3] bg-[#C8C8C8] mb-3 overflow-hidden">
        <div className="w-full h-full bg-[#C8C8C8] transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {categories.map((cat, i) => (
          <span key={i} className="text-xs text-(--color-primary) tracking-wide">
            {cat}{i < categories.length - 1 && <span className="text-(--color-primary)/40 mx-1">/</span>}
          </span>
        ))}
      </div>
      <p className="text-md font-medium text-(--color-text) mb-2">{title}</p>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="text-xs border border-(--color-primary) text-(--color-primary) px-2 py-0.5 bg-white"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
