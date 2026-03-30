import SectionTitle from "@/components/ui/section-title";
import WorksCard from "./WorksCard";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
import { type Work, type Category } from "../page";

type WorksContentProps = {
  works: Work[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function WorksContent({ works, categories, currentPage, totalPages, basePath }: WorksContentProps) {
  return (
    <section className="bg-(--color-sub) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle color="primary" as="h1">WORK</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_5fr] gap-8 mb-16">
          <CategorySelector categories={categories} />
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {works.map((work) => (
                <WorksCard key={work.id} id={work.id} title={work.title} tags={work.tags} categories={work.categories} imageSrc={work.imageSrc} />
              ))}
            </div>
            <div className="mt-16">
              <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
