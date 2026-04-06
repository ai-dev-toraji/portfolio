import type { MicroCMSQueries } from 'microcms-js-sdk'
import {
  getAllCategoryWithTotalCount,
  getWorksList,
} from '@/api/microCMS/works'

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorksContent from "./components/WorksContent";

export const metadata = {
  title: "Works | NEXTORA",
};

export const ITEMS_PER_PAGE = 12;

export default async function WorksPage() {

  const indexQueries: MicroCMSQueries = {
    limit: ITEMS_PER_PAGE,
    fields: 'id,title,eyecatch,tag,category,publishedAt',
    orders: "-publishedAt",
  }

  const [worksList, allCategories] = await Promise.all([
    getWorksList(indexQueries),
    getAllCategoryWithTotalCount(),
  ])

  return (
    <>
      <Header />
      <main className="pt-16">
        <WorksContent
          works={worksList}
          categories={allCategories}
          currentPage={1}
          totalPages={Math.ceil(worksList.totalCount / ITEMS_PER_PAGE)}
          basePath="/works"
        />
      </main>
      <Footer />
    </>
  );
}
