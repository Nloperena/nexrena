import { FadeIn } from "./FadeIn";

const steps = [
  { num: "01", title: "Discovery", desc: "Deep dive into your business model, current metrics, and growth objectives." },
  { num: "02", title: "Strategy", desc: "Written execution plan, technical architecture, and design direction." },
  { num: "03", title: "Execution", desc: "High-fidelity design, custom development, and SEO implementation." },
  { num: "04", title: "Delivery", desc: "Performance testing, launch, and ongoing growth optimization." },
];

export function Process() {
  return (
    <section className="py-32 bg-obsidian text-warmWhite relative z-10 border-t border-white/5">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <FadeIn>
          <div className="flex items-center gap-4 mb-20">
            <span className="w-12 h-[1px] bg-gold" />
            <h2 className="font-mono text-sm tracking-widest uppercase text-gold-dim">
              How We Work //
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
          {/* Horizontal connection line for desktop */}
          <div className="hidden lg:block absolute top-[28px] left-0 w-full h-[1px] bg-white/10 z-0" />
          
          {steps.map((step, i) => (
            <FadeIn key={step.num} delay={i * 200} className="relative z-10">
              <div className="flex flex-col">
                <div className="w-14 h-14 rounded-full bg-slate border border-white/10 flex items-center justify-center mb-8 shrink-0">
                  <span className="font-mono text-gold text-sm">{step.num}</span>
                </div>
                <h3 className="font-display text-2xl lg:text-3xl mb-4">{step.title}</h3>
                <p className="font-body text-warmWhite/60 font-light text-sm md:text-base pr-4">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
