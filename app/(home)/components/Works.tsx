import Button from "@/components/ui/button";
import SectionTitle from "@/components/ui/section-title";
import WorksCard from "@/components/ui/works-card";

const works = [
  { id: 1, title: "Work 01", category: "Web Design" },
  { id: 2, title: "Work 02", category: "WordPress" },
  { id: 3, title: "Work 03", category: "Frontend" },
  { id: 4, title: "Work 04", category: "Web Design" },
  { id: 5, title: "Work 05", category: "Coding" },
  { id: 6, title: "Work 06", category: "Frontend" },
];

export default function Works() {
  return (
    <section id="works" className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Title */}
        <SectionTitle color="accent">WORKS</SectionTitle>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {works.map((work) => (
            <WorksCard
              key={work.id}
              title={work.title}
              category={work.category}
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
