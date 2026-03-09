import { FadeIn } from "./FadeIn";

const services = [
  {
    num: "01",
    title: "Web Design & Development",
    desc: "High-performance websites and web applications built on modern frameworks. We deliver scalable, lightning-fast digital experiences that convert.",
  },
  {
    num: "02",
    title: "SEO & Search Growth",
    desc: "Technical SEO, content strategy, and organic growth systems that compound over time. Built to dominate search engine results.",
  },
  {
    num: "03",
    title: "Full-Service Growth",
    desc: "The complete digital engine: web, SEO, paid search, and analytics working as one integrated system to drive measurable revenue.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-32 bg-cream text-obsidian relative z-20">
      <div className="container mx-auto px-6 md:px-12">
        <FadeIn>
          <div className="flex items-center gap-4 mb-16">
            <span className="w-12 h-[1px] bg-gold" />
            <h2 className="font-mono text-sm tracking-widest uppercase text-gold-dim">
              What We Build //
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <FadeIn key={s.num} delay={i * 200} className="h-full">
              <div className="service-card h-full bg-warmWhite p-10 lg:p-14 flex flex-col group cursor-default shadow-sm hover:shadow-xl transition-shadow duration-500 border border-black/5">
                <span className="font-mono text-xs text-gold tracking-widest mb-8 block">
                  {s.num} //
                </span>
                <h3 className="font-display text-3xl lg:text-4xl mb-6 leading-tight">
                  {s.title}
                </h3>
                <p className="font-body text-obsidian/70 font-light leading-relaxed mt-auto">
                  {s.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
