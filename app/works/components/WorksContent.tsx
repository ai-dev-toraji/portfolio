import { MicroCMSListResponse } from 'microcms-js-sdk'
import type { WorksContent, CategoryWithCount } from '@/api/microCMS/works/types'

import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
// import { type Work, type Category } from "../page";

type WorksContentProps = {
  works: MicroCMSListResponse<WorksContent>
  categories: CategoryWithCount[];
  currentPage: number;
  totalPages: number;
  basePath: string;
};

export default function WorksContent({ works, categories, currentPage, totalPages, basePath }: WorksContentProps) {
  return (
    <section className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle color="accent" as="h1">WORK</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] gap-8 mb-16">
          <CategorySelector categories={categories} totalCount={works.totalCount} />
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {works.contents.map((work) => (
                <WorksCard key={work.id} id={work.id} title={work.title} tags={work.tag} categories={work.category} eyecatch={work.eyecatch} />
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
