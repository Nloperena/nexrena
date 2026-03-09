import { FadeIn } from "./FadeIn";

const projects = [
  {
    client: "Forzabuilt",
    category: "Industrial B2B",
    year: "2024",
    link: "#",
  },
  {
    client: "Rugged Red",
    category: "Headless E-Commerce",
    year: "2024",
    link: "#",
  },
  {
    client: "VITO Fryfilter",
    category: "Shopify / Global",
    year: "2024",
    link: "#",
  },
  {
    client: "Furniture Packages USA",
    category: "B2B Procurement",
    year: "2024",
    link: "#",
  },
];

export function Portfolio() {
  return (
    <section id="work" className="py-32 bg-obsidian text-warmWhite relative z-10 border-t border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <FadeIn>
          <div className="flex items-center gap-4 mb-20">
            <span className="w-12 h-[1px] bg-gold" />
            <h2 className="font-mono text-sm tracking-widest uppercase text-gold-dim">
              Selected Work //
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {projects.map((p, i) => (
            <FadeIn key={p.client} delay={i % 2 === 0 ? 0 : 200}>
              <div className="group block">
                {/* Image Placeholder Frame */}
                <div className="bg-slate aspect-[4/3] w-full overflow-hidden relative mb-6 border border-white/5">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate to-obsidian group-hover:scale-105 transition-transform duration-700 ease-out">
                    <span className="font-mono text-xs text-white/20 tracking-widest">{p.client} Visual</span>
                  </div>
                </div>
                
                {/* Meta & Title */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-gold-dim mb-3 flex items-center gap-3">
                      <span>{p.category}</span>
                      <span className="w-4 h-[1px] bg-gold/50" />
                      <span>{p.year}</span>
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl text-warmWhite group-hover:text-gold transition-colors duration-300">
                      {p.client}
                    </h3>
                  </div>
                  <a
                    href={p.link}
                    className="font-mono text-xs uppercase tracking-widest text-warmWhite/60 hover:text-gold transition-colors inline-flex items-center gap-2 pb-1 border-b border-transparent hover:border-gold"
                  >
                    Visit Live <span>&rarr;</span>
                  </a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
