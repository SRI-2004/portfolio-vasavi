'use client';

import * as NavigationMenu from '@radix-ui/react-navigation-menu';

export function Navigation() {
  return (
    <NavigationMenu.Root
      className="site-nav"
      aria-label="Primary navigation"
    >
      <NavigationMenu.List className="page-shell site-nav__inner p-0">
        <NavigationMenu.Item className="m-0 justify-self-start p-0">
          <NavigationMenu.Link asChild>
            <a
              href="#top"
              className="site-nav__brand transition-opacity hover:opacity-70"
              aria-label="Vasavi Sridhar home"
            >
              Vasavi Sridhar
            </a>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item className="site-nav__tagline-item m-0 justify-self-center p-0">
          <span className="site-nav__tagline">
            Material futures shaped through living systems.
          </span>
        </NavigationMenu.Item>

        <NavigationMenu.Item className="m-0 justify-self-end p-0">
          <div className="site-nav__actions">
            <NavigationMenu.Link asChild>
              <a
                href="mailto:hello@example.com"
                className="site-nav__pill site-nav__pill--primary"
              >
                Let&apos;s Talk
              </a>
            </NavigationMenu.Link>
            <NavigationMenu.Trigger className="site-nav__pill site-nav__pill--secondary">
              Menu
            </NavigationMenu.Trigger>
          </div>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
