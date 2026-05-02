import Link from 'next/link';

const educationItems = [
  {
    label: 'Education',
    title: 'Design Futures',
    body: 'Research-led exploration of speculative materials, ecological systems, and designed interactions.',
  },
  {
    label: 'Achievements',
    title: 'Material Innovation',
    body: 'Selected studies in biofabrication, circular craft systems, and tactile digital prototyping.',
  },
  {
    label: 'Practice',
    title: 'Systems Design',
    body: 'Bridging workshops, field observation, and visual storytelling for future-facing organizations.',
  },
];

const logos = ['Studio A', 'BioLab', 'Future Works', 'Material Co.', 'Design Cell', 'Forma', 'Lumen'];

const stackedLines = [
  'Materials as living interfaces.',
  'Research as choreography.',
  'Systems that invite slower futures.',
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

export function PortfolioSections() {
  return (
    <main className="relative z-10 bg-transparent text-[#191919]">
      <section className="content-band stacked-text-section">
        <div className="section-kicker">Approach</div>
        <div className="stacked-text-wrap">
          {stackedLines.map((line) => (
            <p key={line} className="stacked-text-line">
              {line}
            </p>
          ))}
        </div>
      </section>

      <section className="content-band reveal-on-scroll">
        <div className="section-kicker">Education & Achievements</div>
        <div className="grid gap-4 md:grid-cols-3">
          {educationItems.map((item) => (
            <article key={item.title} className="futuristic-panel">
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band overflow-hidden reveal-on-scroll">
        <div className="section-kicker">Collaborations</div>
        <div className="logo-reel" aria-label="Organizations placeholder reel">
          <div className="logo-track">
            {[...logos, ...logos].map((logo, index) => (
              <span key={`${logo}-${index}`}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="content-band reveal-on-scroll">
        <div className="grid gap-6 md:grid-cols-[1fr_0.45fr] md:items-end">
          <h2 className="text-6xl font-medium leading-none md:text-8xl">Featured Work</h2>
          <p className="max-w-md text-sm font-medium uppercase leading-relaxed text-[#191919]/70">
            Placeholder project tiles for biodesign, material research, and future-facing visual systems.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.slug} href={`/projects/${project.slug}`} className="project-tile">
              <div className="project-image" style={{ background: project.image }}>
                <span />
              </div>
              <p>{project.meta}</p>
              <h3>{project.title}</h3>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
