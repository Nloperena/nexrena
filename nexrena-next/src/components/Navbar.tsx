export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#" className="font-display text-2xl tracking-wide">
          <span className="text-warmWhite">Nex</span><span className="text-gold">rena</span>
        </a>
        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase">
          <a href="#services" className="text-warmWhite/70 hover:text-gold transition-colors">Services</a>
          <a href="#work" className="text-warmWhite/70 hover:text-gold transition-colors">Work</a>
          <a href="#contact" className="text-obsidian bg-gold hover:bg-gold-dim transition-colors px-5 py-2.5">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
