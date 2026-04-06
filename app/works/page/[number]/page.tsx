import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorksContent from "../../components/WorksContent";
import { getWorksList, getAllCategoryWithTotalCount } from "@/api/microCMS/works";
import { ITEMS_PER_PAGE } from "../../page";

type Props = {
  params: Promise<{ number: string }>;
};

export async function generateStaticParams() {
  const result = await getWorksList({ limit: 1 });
  const totalPages = Math.ceil(result.totalCount / ITEMS_PER_PAGE);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
    number: String(i + 2),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  return {
    title: `Works - ${number}ページ目 | NEXTORA`,
  };
}

export default async function WorksPageNumber({ params }: Props) {
  const { number } = await params;
  const currentPage = Number(number);

  const [worksList, allCategories] = await Promise.all([
    getWorksList({
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      fields: "id,title,eyecatch,tag,category,publishedAt",
      orders: "-publishedAt",
    }),
    getAllCategoryWithTotalCount(),
  ]);

  const totalPages = Math.ceil(worksList.totalCount / ITEMS_PER_PAGE);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > totalPages) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <WorksContent
          works={worksList}
          categories={allCategories}
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/works"
        />
      </main>
      <Footer />
    </>
  );
}
