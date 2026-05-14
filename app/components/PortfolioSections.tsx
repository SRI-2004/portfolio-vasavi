'use client';

import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getProjectMeta, type Project } from '@/app/data/projects';
import { prefersReducedMotion } from '@/app/utils/helpers';

const awardsColumns = [
  [
    {
      text: 'Won Honorable Mention award with a cash prize by Taiwan International Student Design Competition-2024 in the Product Design category (2024)',

    },
    {
      text: 'Won the Himalayan Wool innovation challenge initiated by Echostream, UNDP Accelerator Lab in partnership with the People of Japan project, in the scouring category. (2025)',
      href: 'https://www.linkedin.com/posts/undp-in-india_wonder-activity-7254009407083032577-Vr9T',
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
      href: 'https://www.thinkarts.co.in/millipede.html',
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
  { name: 'Sample logo 05', src: '/images/logos/sample-logo-05.svg' },
  { name: 'Sample logo 06', src: '/images/logos/sample-logo-06.svg' },
];

const portfolioMotion = {
  revealDuration: 1.15,
  ease: 'power2.out',
};

const DESKTOP_VISIBLE_PROJECTS = 2;
const MOBILE_VISIBLE_PROJECTS = 1;

function canUseNextImage(src: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return src.startsWith('/') || Boolean(supabaseUrl && src.startsWith(supabaseUrl));
}

function ProjectCard({ project, index, className = '' }: { project: Project; index?: number; className?: string }) {
  const useNextImage = canUseNextImage(project.cardImage.src);

  return (
    <Link href={`/projects/${project.slug}`} className={`project-card ${className}`} data-project-card-index={index}>
      {useNextImage ? (
        <Image
          className="project-thumb"
          src={project.cardImage.src}
          alt={project.cardImage.alt}
          width={1200}
          height={828}
          sizes="(min-width: 768px) 50vw, 100vw"
          draggable={false}
          data-project-image
        />
      ) : (
        <img className="project-thumb" src={project.cardImage.src} alt={project.cardImage.alt} draggable={false} data-project-image />
      )}
      <p className="project-meta" data-project-text>{getProjectMeta(project)}</p>
      <h3 className="project-name" data-project-text>{project.title.toUpperCase()}</h3>
    </Link>
  );
}

export function PortfolioSections({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const projectWindowRef = useRef<HTMLDivElement>(null);
  const homeProjects = useMemo(() => projects, [projects]);
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [visibleProjects, setVisibleProjects] = useState(DESKTOP_VISIBLE_PROJECTS);
  const maxProjectIndex = Math.max(0, homeProjects.length - visibleProjects);
  const isAtFirstProject = activeProjectIndex <= 0;
  const isAtLastProject = activeProjectIndex >= maxProjectIndex;
  const carouselStyle = {
    '--project-visible': visibleProjects,
  } as CSSProperties;

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const updateVisibleProjects = () => {
      setVisibleProjects(media.matches ? DESKTOP_VISIBLE_PROJECTS : MOBILE_VISIBLE_PROJECTS);
    };

    updateVisibleProjects();
    media.addEventListener('change', updateVisibleProjects);
    return () => media.removeEventListener('change', updateVisibleProjects);
  }, []);

  useEffect(() => {
    setActiveProjectIndex((currentIndex) => Math.min(currentIndex, maxProjectIndex));
  }, [maxProjectIndex]);

  useEffect(() => {
    const projectWindow = projectWindowRef.current;
    const targetProject = projectWindow?.querySelector<HTMLElement>(`[data-project-card-index="${activeProjectIndex}"]`);

    if (!projectWindow || !targetProject) return;

    projectWindow.scrollTo({
      left: targetProject.offsetLeft,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activeProjectIndex]);

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

      gsap.from('[data-project-image]', {
        autoAlpha: 0,
        scale: 0.96,
        clipPath: 'inset(9% 7% 12% 7% round 8px)',
        stagger: 0.1,
        duration: 1.05,
        ease: portfolioMotion.ease,
        scrollTrigger: {
          trigger: '[data-project-carousel]',
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
          trigger: '[data-project-carousel]',
          start: 'top 70%',
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={rootRef} className="portfolio-motion relative z-10 bg-transparent text-[#191919]">
      <div className="about-awards-transition" aria-hidden="true" />

      <section id="research" className="content-band awards-section" data-education-section>
        <div className="awards-inner">
          <div className="awards-layout">
            <div className="awards-intro-column" data-awards-column>
              <h2 className="awards-heading">
                AWARDS &<br />
                RECOGNITION
              </h2>
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

      <section id="projects" className="content-band work-section" data-feature-section>
        <Link href="/projects" className="work-heading">
          PROJECTS
        </Link>

        <div className="project-carousel" data-project-carousel style={carouselStyle}>
          {homeProjects.length ? (
            <div className="project-window" ref={projectWindowRef}>
              <div className="project-track">
                {homeProjects.map((project, index) => (
                  <ProjectCard key={project.slug} project={project} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <p className="project-empty">Projects will appear here once they are published.</p>
          )}

          {homeProjects.length ? (
            <>
              <div className="project-edge project-edge--left" aria-hidden={isAtFirstProject}>
                {!isAtFirstProject && (
                  <button
                    className="project-control"
                    type="button"
                    aria-label="Previous projects"
                    onClick={() => setActiveProjectIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                  >
                    ←
                  </button>
                )}
              </div>

              <div className="project-edge project-edge--right">
                {isAtLastProject ? (
                  <Link className="project-control project-control--more" href="/projects">
                    See more
                  </Link>
                ) : (
                  <button
                    className="project-control"
                    type="button"
                    aria-label="Next projects"
                    onClick={() => setActiveProjectIndex((currentIndex) => Math.min(maxProjectIndex, currentIndex + 1))}
                  >
                    →
                  </button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>
      <div id="contact" className="h-px" aria-hidden="true" />
    </main>
  );
}
