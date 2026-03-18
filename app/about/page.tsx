import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Profile from "./components/Profile";
import SkillSection from "./components/SkillSection";

export const metadata = {
  title: "About | MORI CORDER",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Profile />
        <SkillSection />
      </main>
      <Footer />
    </>
  );
}
