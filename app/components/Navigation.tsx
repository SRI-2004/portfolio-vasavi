'use client';

export function Navigation() {
  return (
    <nav className="fixed left-0 top-0 z-40 h-screen w-24 border-r border-black/15 bg-white/70 backdrop-blur-sm pointer-events-none md:w-28">
      <div className="flex h-full flex-col items-center justify-between py-8">
        <div className="font-serif text-2xl italic leading-none text-black md:text-3xl">VS</div>
        <div
          className="font-serif text-[0.72rem] uppercase tracking-[0.32em] text-black md:text-xs"
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          Vasavi Sridhar
        </div>
        <div className="h-16 w-px bg-black/30" />
      </div>
    </nav>
  );
}
