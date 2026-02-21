import Header from "./components/Header";
import Hero from "./components/Hero";
import Works from "./components/Works";
import Service from "./components/Service";
import Footer from "./components/Footer";

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
