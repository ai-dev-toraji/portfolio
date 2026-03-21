import Image from "next/image";

export type Skill = {
  iconSrc: string;
  name: string;
  experience?: number;
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
        <span className="text-white text-xs leading-relaxed">使用経験：{skill.experience}年目</span>
      </div>
    </div>
  );
}
