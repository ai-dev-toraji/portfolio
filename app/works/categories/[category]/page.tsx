import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
import { getWorksList, getWorkCategoryList, getAllCategoryWithTotalCount } from "@/api/microCMS/works";
import { ITEMS_PER_PAGE } from "../../page";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  const categoryList = await getWorkCategoryList();
  if (!categoryList) return [];
  return categoryList.map((cat) => ({ category: cat.value }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const categoryList = await getWorkCategoryList();
  const cat = categoryList?.find((c) => c.value === category);
  return {
    title: `${cat?.label ?? category} | Works | NEXTORA`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const [categoryList, allCategories, allWorks] = await Promise.all([
    getWorkCategoryList(),
    getAllCategoryWithTotalCount(),
    getWorksList({ limit: 1, fields: 'id' }),
  ]);

  const cat = categoryList?.find((c) => c.value === category);
  if (!cat) notFound();

  const worksList = await getWorksList({
    limit: ITEMS_PER_PAGE,
    fields: "id,title,eyecatch,tag,category,publishedAt",
    orders: "-publishedAt",
    filters: `category[contains]${cat.id}`,
  });

  const totalPages = Math.ceil(worksList.totalCount / ITEMS_PER_PAGE);
  const basePath = `/works/categories/${category}`;

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="bg-(--color-primary) py-20 md:py-28 min-h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto px-6">
            <SectionTitle color="accent" as="h1">{cat.label}</SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_4fr] gap-8 mb-16">
              <CategorySelector categories={allCategories} totalCount={allWorks.totalCount} />

              <div>
                {worksList.contents.length > 0 ? (
                  <>
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
                      <Pagination currentPage={1} totalPages={totalPages} basePath={basePath} />
                    </div>
                  </>
                ) : (
                  <p className="text-center text-(--color-accent)/50 text-sm">
                    該当する実績がありません。
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
