import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
import { works, categories, ITEMS_PER_PAGE } from "../../page";

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return categories.map((cat) => ({
    category: cat.value,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const cat = categories.find((c) => c.value === category);
  return {
    title: `${cat?.label ?? category} | Works | NEXTORA`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = categories.find((c) => c.value === category);

  if (!cat) {
    notFound();
  }

  const allFiltered = works
    .filter((work) => work.categories.includes(cat.label))
    .sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);
  const pagedWorks = allFiltered.slice(0, ITEMS_PER_PAGE);
  const basePath = `/works/categories/${category}`;

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="bg-(--color-primary) py-20 md:py-28 min-h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto px-6">
            <SectionTitle color="accent" as="h1">WORK</SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_5fr] gap-8 mb-16">
              <CategorySelector categories={categories} />

              <div>
                {pagedWorks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                      {pagedWorks.map((work) => (
                        <WorksCard
                          key={work.id}
                          id={work.id}
                          title={work.title}
                          tags={work.tags}
                          categories={work.categories}
                          imageSrc={work.imageSrc}
                        />
                      ))}
                    </div>
                    <div className="mt-16">
                      <Pagination currentPage={1} totalPages={totalPages} basePath={basePath} />
                    </div>
                  </>
                ) : (
                  <p className="text-center text-(--color-text)/50 text-sm">
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
