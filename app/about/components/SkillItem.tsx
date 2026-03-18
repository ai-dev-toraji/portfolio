import Image from "next/image";

export type Skill = {
  name: string;
  description: string;
  iconSrc: string;
};

export default function SkillItem({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-start gap-4 py-5 border-b border-white/10">
      <div
        className="w-16 h-16 flex-shrink-0 flex items-center justify-center text-sm font-bold bg-white"
      >
        <Image src={skill.iconSrc} alt={skill.name} width={50} height={50} />
      </div>
      <div>
        <h4 className="text-white font-bold text-base mb-1.5">{skill.name}</h4>
        <p className="text-white text-xs leading-relaxed">{skill.description}</p>
      </div>
    </div>
  );
}
