import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContactForm from "./components/ContactForm";

export const metadata = {
  title: "Contact | MORI CORDER",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
