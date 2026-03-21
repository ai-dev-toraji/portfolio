import SectionTitle from "@/components/ui/section-title";
import SkillList from "./SkillList";
import { type Skill } from "./SkillItem";

type SkillGroup = {
  title: string;
  description: string;
  skills: Skill[];
};

type SkillSectionProps = {
  skillGroups: SkillGroup[];
};

export default function SkillSection({ skillGroups }: SkillSectionProps) {
  return (
    <section className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="accent">SKILL</SectionTitle>

        <div className="mx-auto">
          {skillGroups.map((group, i) => (
            <SkillList
              key={group.title}
              title={group.title}
              description={group.description}
              skills={group.skills}
              className={i > 0 ? "mt-12" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
