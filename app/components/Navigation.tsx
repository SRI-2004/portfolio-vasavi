const navItems = [
  { label: 'Projects', href: '#projects' },
  { label: 'Research & Insights', href: '#research' },
  { label: 'About', href: '#about' },
  { label: 'Play', href: '#play' },
  { label: 'Contact', href: '#contact' },
];

export function Navigation() {
  return (
    <header className="site-nav">
      <nav className="page-shell site-nav__inner" aria-label="Primary navigation">
        <a
          href="#top"
          className="site-nav__brand transition-opacity hover:opacity-70"
          aria-label="Vasavi Sridhar home"
        >
          VASAVI SRIDHAR
        </a>

        <div className="site-nav__links" aria-label="Page sections">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
