import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WorksContent from "./components/WorksContent";

export const metadata = {
  title: "Works | MORI CORDER",
};

export default function WorksPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <WorksContent />
      </main>
      <Footer />
    </>
  );
}
