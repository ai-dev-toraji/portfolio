import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Hero from "./components/Hero";
import Works from "./components/Works";
import Service from "./components/Service";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Works />
        <Service />
      </main>
      <Footer />
    </>
  );
}
