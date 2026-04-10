import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
import { getWorksList, getWorkCategoryList, getAllCategoryWithTotalCount } from "@/api/microCMS/works";
import { ITEMS_PER_PAGE } from "../../../../page";

type Props = {
  params: Promise<{ category: string; number: string }>;
};

export async function generateStaticParams() {
  const categoryList = await getWorkCategoryList();
  if (!categoryList) return [];

  const params: { category: string; number: string }[] = [];

  for (const cat of categoryList) {
    const result = await getWorksList({
      limit: 1,
      filters: `category[contains]${cat.id}`,
    });
    const totalPages = Math.ceil(result.totalCount / ITEMS_PER_PAGE);
    for (let i = 2; i <= totalPages; i++) {
      params.push({ category: cat.value.trim(), number: String(i) });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props) {
  const { category, number } = await params;
  const categoryList = await getWorkCategoryList();
  const cat = categoryList?.find((c) => c.value.trim() === category);
  return {
    title: `${cat?.label ?? category} - ${number}ページ目 | Works | NEXTORA`,
  };
}

export default async function CategoryPageNumber({ params }: Props) {
  const { category, number } = await params;
  const currentPage = Number(number);

  const [categoryList, allCategories, allWorks] = await Promise.all([
    getWorkCategoryList(),
    getAllCategoryWithTotalCount(),
    getWorksList({ limit: 1, fields: 'id' }),
  ]);

  const cat = categoryList?.find((c) => c.value.trim() === category);
  if (!cat) notFound();

  const worksList = await getWorksList({
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    fields: "id,title,eyecatch,tag,category,publishedAt",
    orders: "-publishedAt",
    filters: `category[contains]${cat.id}`,
  });

  const totalPages = Math.ceil(worksList.totalCount / ITEMS_PER_PAGE);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > totalPages) {
    notFound();
  }

  const basePath = `/works/categories/${category}`;

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="bg-(--color-primary) py-20 md:py-28 min-h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto px-6">
            <SectionTitle color="accent" as="h1">WORK</SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] gap-8 mb-16">
              <CategorySelector categories={allCategories} totalCount={allWorks.totalCount} />

              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                  {worksList.contents.map((work) => (
                    <WorksCard
                      key={work.id}
                      id={work.id}
                      title={work.title}
                      tags={work.tag}
                      categories={work.category}
                      eyecatch={work.eyecatch}
                    />
                  ))}
                </div>
                <div className="mt-16">
                  <Pagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
