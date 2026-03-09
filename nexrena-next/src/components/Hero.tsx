import { FadeIn } from "./FadeIn";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-obsidian z-10">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-5xl">
          <FadeIn delay={100}>
            <p className="font-mono text-xs md:text-sm text-gold-dim tracking-widest uppercase mb-8">
              Digital Growth Agency — Orlando, FL
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <h1 className="font-display text-5xl md:text-7xl lg:text-[100px] leading-[0.9] tracking-tight text-warmWhite mb-10">
              Built to perform. <br />
              <span className="text-white/60 italic">Designed to last.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={500}>
            <div className="w-full max-w-md h-[1px] bg-gold opacity-30 mb-10" />
          </FadeIn>

          <FadeIn delay={700}>
            <p className="font-body text-lg md:text-xl text-warmWhite/70 max-w-2xl mb-12 font-light leading-relaxed">
              We build the digital engine. You run the company. Premium web design, development, and SEO for businesses that mean business.
            </p>
          </FadeIn>

          <FadeIn delay={900}>
            <a
              href="#contact"
              className="inline-flex items-center gap-3 font-mono text-sm uppercase tracking-widest text-obsidian bg-gold hover:bg-gold-dim transition-colors px-8 py-4"
            >
              Start a Project <span>&rarr;</span>
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
