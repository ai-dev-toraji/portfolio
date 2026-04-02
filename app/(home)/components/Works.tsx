import Button from "@/components/ui/button";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";
import { works } from "@/app/works/page";

const latestWorks = [...works].sort((a, b) => b.id - a.id).slice(0, 6);

export default function Works() {
  return (
    <section id="works" className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <SectionTitle color="accent">WORKS</SectionTitle>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestWorks.map((work) => (
            <WorksCard
              key={work.id}
              id={work.id}
              title={work.title}
              imageSrc={work.imageSrc}
              tags={work.tags}
              categories={work.categories}
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
