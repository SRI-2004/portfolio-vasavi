type NavigationProps = {
  activeItem?: 'projects';
};

const navItems = [
  { key: 'projects', label: 'Projects', href: '#projects', pageHref: '/projects' },
  { key: 'research', label: 'Research & Insights', href: '#research', pageHref: '/#research' },
  { key: 'about', label: 'About', href: '#about', pageHref: '/#about' },
  { key: 'play', label: 'Play', href: '#play', pageHref: '/#play' },
  { key: 'contact', label: 'Contact', href: '#contact', pageHref: '/#contact' },
];

export function Navigation({ activeItem }: NavigationProps) {
  return (
    <header className={`site-nav${activeItem ? ' site-nav--compact' : ''}`}>
      <nav className="page-shell site-nav__inner" aria-label="Primary navigation">
        <a
          href={activeItem ? '/' : '#top'}
          className="site-nav__brand transition-opacity hover:opacity-70"
          aria-label="Vasavi Sridhar home"
        >
          VASAVI SRIDHAR
        </a>

        <div className="site-nav__links" aria-label="Page sections">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={activeItem ? item.pageHref : item.href}
              className="site-nav__link"
              data-active={activeItem === item.key}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
