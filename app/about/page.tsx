import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Profile, { type ProfileGroup } from "./components/Profile";
import SkillSection from "./components/SkillSection";
import { type Skill } from "./components/SkillItem";

export const metadata = {
  title: "About | NEXTORA",
};

const profileGroups: ProfileGroup[] = [
  {
    title: "自己紹介",
    className: "mb-10",
    children: (
      <>
        <p>名前：森寅治</p>
        <p>生年月日：1996年5月7日(29歳)</p>
        <p>出身地：岐阜県</p>
      </>
    ),
  },
  {
    title: "経歴",
    children: (
      <>
        <p>（2021年8月~現在）</p>
        <p>Web制作フリーランスとして、コーディング、WordPress構築をメインに活動中。</p>
        <p>（2023年2月~9月）</p>
        <p>Webアプリ開発に携わる。バックエンドからフロントエンド開発まで一貫して開発に携わりました。</p>
        <p>（2024年9月~現在）</p>
        <p>フロンエンド開発（React.js、Next.js）に携わる。</p>
      </>
    ),
  },
];

const webSkills: Skill[] = [
  { name: "HTML",       iconSrc: "/about/icon_html.svg",       experience: 5   },
  { name: "CSS",        iconSrc: "/about/icon_css.svg",        experience: 5   },
  { name: "JavaScript", iconSrc: "/about/icon_js.svg",         experience: 5   },
  { name: "Sass",       iconSrc: "/about/icon_scss.svg",       experience: 5   },
  { name: "GSAP",       iconSrc: "/about/icon_gsap.png",       experience: 3   },
  { name: "PHP",        iconSrc: "/about/icon_php.png",        experience: 5   },
  { name: "WordPress",  iconSrc: "/about/icon_wordpress.svg",  experience: 5   },
];

const frontendSkills: Skill[] = [
  { name: "React.js",     iconSrc: "/about/icon_react.svg",        experience: 3   },
  { name: "Next.js",      iconSrc: "/about/icon_next.png",         experience: 3   },
  { name: "TypeScript",   iconSrc: "/about/icon_typescript.svg",   experience: 3   },
  { name: "Material-UI",  iconSrc: "/about/icon_material-ui.svg",  experience: 1   },
  { name: "Tailwind CSS", iconSrc: "/about/icon_tailwind-css.svg", experience: 2   },
  { name: "Python",       iconSrc: "/about/icon_python.svg",       experience: 0.7 },
  { name: "MicroCMS",     iconSrc: "/about/icon_microcms.svg",     experience: 2   },
];

const skillGroups = [
  {
    title: "Webアプリ開発",
    description: "現在は、主にReact.js、Next.jsを使用して、フロントエンド開発を行っています。開発経験は3年目になります。<br />過去には、7ヶ月間ほどバックエンド（Python）からフロントエンド（React.js）まで一貫して開発を行った経験がございます。",
    skills: frontendSkills,
  },
  {
    title: "Web制作",
    description: "Webサイト制作は、これまでに150件以上のサイトに携わってきました。<br />主に、コーディング、WordPress構築、サイトの保守・運用を担当してきました。",
    skills: webSkills,
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Profile profileGroups={profileGroups} />
        <SkillSection skillGroups={skillGroups} />
      </main>
      <Footer />
    </>
  );
}
