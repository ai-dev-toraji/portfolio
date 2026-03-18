import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ServiceList from "./components/ServiceList";
import PriceSection from "./components/PriceSection";
import FlowSection from "./components/FlowSection";

export const metadata = {
  title: "Service | MORI CORDER",
};

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <ServiceList />
        <PriceSection />
        <FlowSection />
      </main>
      <Footer />
    </>
  );
}
