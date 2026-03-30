import { notFound } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorksContent from "../../components/WorksContent";
import { works, categories, ITEMS_PER_PAGE } from "../../page";

type Props = {
  params: Promise<{ number: string }>;
};

export async function generateStaticParams() {
  const totalPages = Math.ceil(works.length / ITEMS_PER_PAGE);
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    number: String(i + 2),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { number } = await params;
  return {
    title: `Works - ${number}ページ目 | MORI CORDER`,
  };
}

export default async function WorksPageNumber({ params }: Props) {
  const { number } = await params;
  const currentPage = Number(number);
  const sorted = [...works].sort((a, b) => b.id - a.id);
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

  if (isNaN(currentPage) || currentPage < 2 || currentPage > totalPages) {
    notFound();
  }

  const pagedWorks = sorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Header />
      <main className="pt-16">
        <WorksContent
          works={pagedWorks}
          categories={categories}
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/works"
        />
      </main>
      <Footer />
    </>
  );
}
