import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { Portfolio } from "@/components/Portfolio";
import { Testimonials } from "@/components/Testimonials";
import { Process } from "@/components/Process";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative bg-obsidian">
      <Navbar />
      <Hero />
      <Services />
      <Portfolio />
      <Testimonials />
      <Process />
      <Footer />
    </main>
  );
}
