import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { getAllWorks, getWorksDetail } from "@/api/microCMS/works";
import RichEditor from "@/components/ui/rich-editor";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  const allWorks = await getAllWorks({ fields: "id" });
  if (!allWorks) return [];
  return allWorks.map((work) => ({ id: work.id }));
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const work = await getWorksDetail(id);
  return {
    title: `${work?.title ?? "Works"} | NEXTORA`,
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const work = await getWorksDetail(id);

  if (!work) notFound();

  const publishedDate = work.publishedAt
    ? new Date(work.publishedAt).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
    : "";

  // 前後の記事を取得（publishedAt の降順）
  const allWorks = await getAllWorks({
    fields: "id,title,publishedAt",
    orders: "-publishedAt",
  });
  const sortedWorks = allWorks ?? [];
  const currentIndex = sortedWorks.findIndex((w) => w.id === work.id);
  const prevWork = currentIndex > 0 ? sortedWorks[currentIndex - 1] : null;
  const nextWork = currentIndex < sortedWorks.length - 1 ? sortedWorks[currentIndex + 1] : null;

  return (
    <>
      <Header />
      <main className="pt-4">
        <article className="bg-(--color-sub) py-20 md:py-28 min-h-[calc(100vh-64px)]">
          <div className="max-w-4xl mx-auto px-6">

            {/* Meta */}
            <div className="mb-6">
              <time className="text-xs text-(--color-text)/50 tracking-widest">
                {publishedDate}
              </time>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-(--color-text) tracking-wide leading-snug mb-6">
              {work.title}
            </h1>

            {/* Categories */}
            {work.category && work.category.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-(--color-text)/60 tracking-wide">担当：</span>
                {work.category.map((cat, i) => (
                  <span key={cat.id} className="text-xs text-(--color-primary) tracking-wide">
                    {cat.label}{i < work.category!.length - 1 && <span className="text-(--color-primary)/40 mx-1">/</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {work.tag && work.tag.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-(--color-text)/60 tracking-wide">タグ：</span>
                {work.tag.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs border border-(--color-primary) text-(--color-primary) px-2 py-0.5 bg-white"
                  >
                    {tag.tag}
                  </span>
                ))}
              </div>
            )}

            {/* Skills */}
              {work.skill && work.skill.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs text-(--color-text)/60 tracking-wide">スキル：</span>
                  {work.skill.map((skill) => (
                    <span
                      key={skill.id}
                      className="text-xs border border-(--color-primary) text-(--color-primary) px-2 py-0.5 bg-white"
                    >
                      {skill.skill}
                    </span>
                  ))}
                </div>
              )}

            {/* Period */}
            {(work.periodStart || work.periodEnd) && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-(--color-text)/60 tracking-wide">実装期間：</span>
                <span className="text-xs text-(--color-text)/60 tracking-wide">
                  {work.periodStart && new Date(work.periodStart).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                  {work.periodStart && work.periodEnd && " 〜 "}
                  {work.periodEnd && new Date(work.periodEnd).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            )}

            {work.siteUrl && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-(--color-text)/60 tracking-wide">サイトURL：</span>
                <Link href={work.siteUrl} target="_blank" className="text-xs text-(--color-primary) tracking-wide">
                  {work.siteUrl}
                </Link>
              </div>
            )}

            {/* Thumbnail */}
            {/* {(work.pcImg || work.eyecatch) && (
              <div className="aspect-[16/9] bg-[#C8C8C8] mb-12 overflow-hidden">
                <Image
                  src={(work.pcImg ?? work.eyecatch)!.url}
                  alt={work.title}
                  width={(work.pcImg ?? work.eyecatch)!.width ?? 896}
                  height={(work.pcImg ?? work.eyecatch)!.height ?? 504}
                  className="w-full h-full object-cover"
                />
              </div>
            )} */}

            {/* Rich editor content */}
            {work.content && <RichEditor content={work.content} />}

            {/* Navigation */}
            <div className="mt-16 pt-10 border-t border-(--color-primary)/20">
              <div className="grid grid-cols-3 items-center md:gap-4">

                {/* Prev */}
                <div className="flex justify-start">
                  {prevWork ? (
                    <Link href={`/works/${prevWork.id}`} className="group flex flex-col gap-1">
                      <span className="flex items-center gap-2 text-xs text-(--color-primary) tracking-widest transition-colors duration-200 hover:text-(--color-accent)">
                        <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-x-[-1] w-6 h-1">
                          <path d="M-5.24541e-07 6.41606L35.5 6.41605L26.5 0.416016" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                        PREV
                      </span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-xs text-(--color-text)/30 tracking-widest cursor-not-allowed">
                      <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-x-[-1] w-6 h-1">
                        <path d="M-5.24541e-07 6.41606L35.5 6.41605L26.5 0.416016" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                      PREV
                    </span>
                  )}
                </div>

                {/* Back to list */}
                <div className="flex justify-center">
                  <Link
                    href="/works"
                    className="inline-flex items-center gap-2 text-xs tracking-[0.2em] px-4 md:px-6 py-3 border border-(--color-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white transition-all duration-300"
                  >
                    一覧に戻る
                  </Link>
                </div>

                {/* Next */}
                <div className="flex justify-end">
                  {nextWork ? (
                    <Link href={`/works/${nextWork.id}`} className="group flex flex-col items-end gap-1">
                      <span className="flex items-center gap-2 text-xs text-(--color-primary) tracking-widest transition-colors duration-200 hover:text-(--color-accent)">
                        NEXT
                        <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-1">
                          <path d="M-5.24541e-07 6.41606L35.5 6.41605L26.5 0.416016" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                      </span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2 text-xs text-(--color-text)/30 tracking-widest cursor-not-allowed">
                      NEXT
                      <svg viewBox="0 0 38 7" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-1">
                        <path d="M-5.24541e-07 6.41606L35.5 6.41605L26.5 0.416016" stroke="currentColor" strokeWidth="1"/>
                      </svg>
                    </span>
                  )}
                </div>

              </div>
            </div>

          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
