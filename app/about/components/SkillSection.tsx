import SectionTitle from "@/components/ui/section-title";
import SkillItem, { type Skill } from "./SkillItem";

const webSkills: Skill[] = [
  {
    name: "HTML",
    description: "ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_html.svg",
  },
  {
    name: "CSS",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_css.svg",
  },
  {
    name: "JavaScript",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_js.svg",
  },
  {
    name: "Sass",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_scss.svg",
  },
  {
    name: "GSAP",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_gsap.png",
  },
  {
    name: "PHP",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_php.png",
  },
  {
    name: "WordPress",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_wordpress.svg",
  },
];

const frontendSkills: Skill[] = [
  {
    name: "React.js",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_react.svg",
  },
  {
    name: "Next.js",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_next.png",
  },
  {
    name: "TypeScript",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_typescript.svg",
  },
  {
    name: "Material-UI",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_material-ui.svg",
  },
  {
    name: "Tailwind CSS",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_tailwind-css.svg",
  },
  {
    name: "Python",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_python.svg",
  },
  {
    name: "MicroCMS",
    description:
      "ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。ここに記事の内容が入ります。",
    iconSrc: "/about/icon_microcms.svg",
  },
];

export default function SkillSection() {
  return (
    <section className="bg-(--color-primary) py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <SectionTitle color="accent">SKILL</SectionTitle>

        <div className="mx-auto">
          <h3 className="text-(--color-accent) text-2xl font-bold tracking-wide mb-4">
            Webアプリ開発
          </h3>
          <div>
            {frontendSkills.map((skill) => (
              <SkillItem key={skill.name} skill={skill} />
            ))}
          </div>

          <h3 className="text-(--color-accent) text-2xl font-bold tracking-wide mb-4 mt-12">
            Web制作
          </h3>
          <div>
            {webSkills.map((skill) => (
              <SkillItem key={skill.name} skill={skill} />
            ))}
          </div>

          
        </div>
      </div>
    </section>
  );
}
