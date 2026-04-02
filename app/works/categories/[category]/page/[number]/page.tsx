import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import CategorySelector from "@/components/layout/category-selector/CategorySelector";
import Pagination from "@/components/ui/pagination";
import { works, categories, ITEMS_PER_PAGE } from "../../../../page";

type Props = {
  params: Promise<{ category: string; number: string }>;
};

export async function generateStaticParams() {
  return categories.flatMap((cat) => {
    const filtered = works.filter((work) => work.categories.includes(cat.label));
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => ({
      category: cat.value,
      number: String(i + 2),
    }));
  });
}

export async function generateMetadata({ params }: Props) {
  const { category, number } = await params;
  const cat = categories.find((c) => c.value === category);
  return {
    title: `${cat?.label ?? category} - ${number}ページ目 | Works | MORI CORDER`,
  };
}

export default async function CategoryPageNumber({ params }: Props) {
  const { category, number } = await params;
  const cat = categories.find((c) => c.value === category);

  if (!cat) notFound();

  const currentPage = Number(number);
  const allFiltered = works
    .filter((work) => work.categories.includes(cat.label))
    .sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(allFiltered.length / ITEMS_PER_PAGE);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > totalPages) {
    notFound();
  }

  const pagedWorks = allFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
