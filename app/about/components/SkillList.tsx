import SkillItem, { type Skill } from "./SkillItem";

type SkillListProps = {
  title: string;
  description: string;
  skills: Skill[];
  className?: string;
};

export default function SkillList({ title, description, skills, className }: SkillListProps) {
  return (
    <div className={className}>
      <h3 className="text-(--color-accent) text-2xl font-bold tracking-wide mb-4">
        {title}
      </h3>
      <p className="text-white text-sm leading-loose mb-4" dangerouslySetInnerHTML={{ __html: description }} />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4">
        {skills.map((skill) => (
          <SkillItem key={skill.name} skill={skill} />
        ))}
      </div>
    </div>
  );
}
