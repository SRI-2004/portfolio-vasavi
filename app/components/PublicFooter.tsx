const footerLinks = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Mail', href: 'mailto:vasavi9c@gmail.com' },
];

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <p>© Vasavi Sridhar</p>
      <nav aria-label="Social links">
        {footerLinks.map((link) => (
          <a href={link.href} key={link.label}>
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
