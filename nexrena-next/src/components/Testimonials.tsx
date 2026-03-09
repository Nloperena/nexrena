import { FadeIn } from "./FadeIn";

export function Testimonials() {
  return (
    <section className="py-32 bg-cream text-obsidian relative z-20">
      <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
        <FadeIn>
          <span className="font-display text-gold text-6xl md:text-8xl leading-none block mb-6">"</span>
          <blockquote className="font-display text-3xl md:text-5xl lg:text-6xl italic leading-[1.1] tracking-tight mb-12">
            Literally the best single website contact in the history of the company.
          </blockquote>
          <cite className="font-mono text-sm tracking-widest uppercase text-obsidian/60 not-italic flex items-center justify-center gap-4">
            <span className="w-8 h-[1px] bg-gold" />
            Forzabuilt Leadership Team
            <span className="w-8 h-[1px] bg-gold" />
          </cite>
        </FadeIn>
      </div>
    </section>
  );
}
