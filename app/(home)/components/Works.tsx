import Button from "@/components/ui/button";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import { getWorksList } from "@/api/microCMS/works";

export default async function Works() {
  const worksList = await getWorksList({
    limit: 6,
    fields: "id,title,eyecatch,tag,category,publishedAt",
    orders: "-publishedAt",
  });

  return (
    <section id="works" className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <SectionTitle color="accent">WORKS</SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {worksList.contents.map((work) => (
            <WorksCard
              key={work.id}
              id={work.id}
              title={work.title}
              eyecatch={work.eyecatch}
              tags={work.tag}
              categories={work.category}
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <Button href="/works" variant="secondary">一覧を見る</Button>
        </div>
      </div>
    </section>
  );
}
