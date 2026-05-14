const footerLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/vasavi-sridhar/' },
  { label: 'Instagram', href: 'https://www.instagram.com/vasavisridhar' },
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
