'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/app/utils/helpers';

const awardsIntro =
  'My practice spans from apparel/textile design to product design, material innovation, and design research. While my work is aesthetically diverse, my projects weave humanity and sciences through innovative solutions.';

const awardsColumns = [
  [
    {
      text: 'Won Honorable Mention award with a cash prize by Taiwan International Student Design Competition-2024 in the Product Design category (2024)',
      href: 'https://www.tisdc.org/wp-content/uploads/2024_Yearbook.pdf',
    },
    {
      text: 'Won the Himalayan Wool innovation challenge initiated by Echostream, UNDP Accelerator Lab in partnership with the People of Japan project, in the scouring category. (2025)',
      href: 'https://wonder.mmm.page/',
    },
    {
      text: 'Pursuing independent research on biomaterials. Worked on creating a leather alternative (patent pending) “Pseudocorium”.',
    },
    {
      text: 'Top 10 Finalist, PEPE JEANS LONDON Fashion Designer Awards (2023)',
    },
    {
      text: 'Global Talent, UNLEASH (2022)',
    },
    {
      text: 'Top 5, UMO Design Challenge, by UMO Foundation, New York (2022) in the Global Innovation Challenge',
    },
  ],
  [
    {
      text: 'Best Graduation project, NIFT Kolkata (2022)',
    },
    {
      text: 'Created a Sustainable Footwear installation to be published on an interactive website as a part of the Millipede Project funded by the British Council in collaboration with The National Theatre of Scotland (2022)',
      href: 'https://www.nationaltheatrescotland.com/events/millipede',
    },
    {
      text: 'Finalist, Design-a-Bag Competition(2O21), organized by APLF, Hongkong',
    },
    {
      text: '2nd Runner up, INESPO (International Environment and Sustainability Project Olympiad) held in Amsterdam, Netherlands, (2016)',
    },
    {
      text: 'Participated in Zilina Model United Nations, held at Slovakia, and was further sponsored for the “Nurturing Leadership program” to stay there for 3 months, (2015)',
    },
  ],
];

const logos = [
  { name: 'Sample logo 01', src: '/images/logos/sample-logo-01.svg' },
  { name: 'Sample logo 02', src: '/images/logos/sample-logo-02.svg' },
  { name: 'Sample logo 03', src: '/images/logos/sample-logo-03.svg' },
  { name: 'Sample logo 04', src: '/images/logos/sample-logo-04.svg' },
];

const projects = [
  {
    slug: 'living-material-atlas',
    title: 'Living Material Atlas',
    meta: 'BIO DESIGN • RESEARCH • SYSTEMS',
    image: 'linear-gradient(135deg, #191919 0%, #26323f 42%, #0755BB 100%)',
  },
  {
    slug: 'circular-craft-lab',
    title: 'Circular Craft Lab',
    meta: 'MATERIALS • WORKSHOPS • STRATEGY',
    image: 'linear-gradient(135deg, #EFEDEA 0%, #c8c4bd 45%, #191919 100%)',
  },
  {
    slug: 'bio-interface-study',
    title: 'Bio Interface Study',
    meta: 'INTERACTION • SPECULATION • VISUALS',
    image: 'radial-gradient(circle at 30% 30%, #0755BB, transparent 34%), linear-gradient(135deg, #191919, #EFEDEA)',
  },
  {
    slug: 'systems-field-notes',
    title: 'Systems Field Notes',
    meta: 'FIELDWORK • MAPPING • FUTURES',
    image: 'linear-gradient(145deg, #191919 0%, #4a4a45 52%, #EFEDEA 100%)',
  },
];

const portfolioMotion = {
  revealDuration: 1.15,
  ease: 'power2.out',
};

export function PortfolioSections() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !rootRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from('[data-awards-column]', {
        autoAlpha: 0,
        y: 28,
        stagger: 0.08,
        duration: 1.05,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-education-section]',
          start: 'top 70%',
        },
      });

      gsap.from('[data-awards-item]', {
        autoAlpha: 0,
        y: 14,
        stagger: 0.045,
        duration: 0.8,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-education-section]',
          start: 'top 68%',
        },
      });

      gsap.to('[data-logo-track]', {
        xPercent: -5,
        ease: 'none',
        scrollTrigger: {
          trigger: '[data-logo-section]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });

      gsap.from('[data-feature-copy]', {
        autoAlpha: 0,
        y: 22,
        stagger: 0.08,
        duration: 1,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-feature-section]',
          start: 'top 72%',
        },
      });

      gsap.from('[data-project-image]', {
        autoAlpha: 0,
        scale: 0.96,
        clipPath: 'inset(9% 7% 12% 7% round 8px)',
        stagger: 0.1,
        duration: 1.05,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-project-grid]',
          start: 'top 76%',
        },
      });

      gsap.from('[data-project-text]', {
        autoAlpha: 0,
        y: 18,
        stagger: 0.06,
        duration: 0.95,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-project-grid]',
          start: 'top 70%',
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="portfolio-motion relative z-10 bg-transparent text-[#191919]">
      <section id="research" className="content-band awards-section" data-education-section>
        <div className="awards-inner">
          <div className="awards-layout">
            <div className="awards-intro-column" data-awards-column>
              <h2 className="awards-heading">
                AWARDS &<br />
                RECOGNITION
              </h2>
              <p className="awards-intro">{awardsIntro}</p>
            </div>

            {awardsColumns.map((column, columnIndex) => (
              <div className="awards-list" data-awards-column key={`awards-column-${columnIndex}`}>
                {column.map((item) => (
                  <p className="awards-item" data-awards-item key={item.text}>
                    {item.href ? (
                      <a className="awards-link" href={item.href} target="_blank" rel="noreferrer">
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="play" className="content-band overflow-hidden" data-logo-section>
        <div className="section-kicker">Collaborations</div>
        <div className="logo-reel" aria-label="Organizations placeholder reel">
          <div className="logo-track" data-logo-track>
            {[...logos, ...logos].map((logo, index) => (
              <span className="logo-logo" key={`${logo.name}-${index}`}>
                <img className="logo-mark" src={logo.src} alt={logo.name} draggable={false} />
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="content-band featured-section" data-feature-section>
        <div className="grid gap-6 md:grid-cols-[1fr_0.45fr] md:items-end">
          <h2 className="featured-heading" data-feature-copy>Featured Work</h2>
          <p className="featured-copy" data-feature-copy>
            Placeholder project tiles for biodesign, material research, and future-facing visual systems.
          </p>
        </div>

        <div className="project-grid" data-project-grid>
          {projects.map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="project-tile">
              <div className="project-image" data-project-image style={{ background: project.image }}>
                <span />
              </div>
              <p data-project-text>{project.meta}</p>
              <h3 data-project-text className="project-title">
                <span className="project-title-arrow" aria-hidden="true">→</span>
                <span>{project.title}</span>
              </h3>
            </Link>
          ))}
        </div>
      </section>
      <div id="contact" className="h-px" aria-hidden="true" />
    </main>
  );
}
