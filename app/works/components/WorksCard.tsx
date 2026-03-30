import Image from "next/image";
import Link from "next/link";

type WorksCardProps = {
  id: number;
  title: string;
  tags: string[];
  categories: string[];
  imageSrc: string;
};

export default function WorksCard({ id, title, tags, categories, imageSrc}: WorksCardProps) {
  return (
    <Link href={`/works/${id}`} className="cursor-pointer group block">
      <div className="aspect-[4/3] bg-[#C8C8C8] mb-3 overflow-hidden">
        <Image className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={imageSrc} alt={title} width={236} height={150} />
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
      <span className="text-xs text-(--color-text) font-bold tracking-wide">担当：</span>
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
    </Link>
  );
}
