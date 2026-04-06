import Image from "next/image";
import Link from "next/link";
import type { WorkTagContent, WorkCategoryContent } from '@/api/microCMS/works/types'
import type { MicroCMSImage } from 'microcms-js-sdk'

type WorksCardProps = {
  id: string;
  title: string;
  eyecatch?: MicroCMSImage;
  tags?: WorkTagContent[];
  categories?: WorkCategoryContent[];
};

export default function WorksCard({ id, title, eyecatch, tags, categories }: WorksCardProps) {
  return (
    <Link href={`/works/${id}`} className="cursor-pointer group block">
      <div className="aspect-[4/3] bg-[#C8C8C8] mb-3 overflow-hidden">
        <Image className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src={eyecatch?.url || '/works/thumbnail.jpg'} alt={title} width={270} height={200} />
      </div>
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-xs text-white font-bold tracking-wide">担当：</span>
          {categories.map((cat, i) => (
            <span key={cat.id} className="text-xs text-white tracking-wide">
              {cat.label}{i < categories.length - 1 && <span className="text-white/40 mx-1">/</span>}
            </span>
          ))}
        </div>
      )}
      <p className="text-md font-medium text-(--color-accent) mb-2">{title}</p>
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs border border-(--color-primary)/70 text-(--color-primary)/70 px-2 py-0.5 bg-white"
            >
              {tag.tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
