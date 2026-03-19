import { FadeIn } from "./FadeIn";

export function Footer() {
  return (
    <footer id="contact" className="bg-obsidian text-warmWhite relative z-20 border-t border-gold">
      <div className="container mx-auto px-6 md:px-12 py-20 lg:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <FadeIn>
              <span className="font-display text-4xl block mb-6">
                <span className="text-warmWhite">Nex</span><span className="text-gold">rena</span>
              </span>
              <p className="font-body text-warmWhite/60 max-w-sm font-light mb-10">
                Built to perform. Designed to last. Premium digital growth agency for businesses that mean business.
              </p>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={200}>
              <h4 className="font-mono text-xs tracking-widest text-gold-dim uppercase mb-6">Menu</h4>
              <ul className="flex flex-col gap-4 font-body font-light text-warmWhite/80">
                <li><a href="#work" className="hover:text-gold transition-colors">Work</a></li>
                <li><a href="#services" className="hover:text-gold transition-colors">Services</a></li>
                <li><a href="#contact" className="hover:text-gold transition-colors">Contact</a></li>
              </ul>
            </FadeIn>
          </div>

          <div>
            <FadeIn delay={400}>
              <h4 className="font-mono text-xs tracking-widest text-gold-dim uppercase mb-6">Connect</h4>
              <ul className="flex flex-col gap-4 font-body font-light text-warmWhite/80">
                <li>
                  <a href="mailto:NicholasL@Nexrena.com" className="hover:text-gold transition-colors">
                    NicholasL@Nexrena.com
                  </a>
                </li>
                <li>
                  <a href="https://nexrena.com" className="hover:text-gold transition-colors">
                    nexrena.com
                  </a>
                </li>
              </ul>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={600}>
          <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono text-xs text-warmWhite/40 tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Nexrena LLC
            </p>
            <p className="font-mono text-xs text-warmWhite/40 tracking-widest uppercase">
              Orlando, FL
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
