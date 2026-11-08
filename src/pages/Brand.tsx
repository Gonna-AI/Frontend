import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, Check, Copy, FileJson, FileCode2, Mail, X } from 'lucide-react';

import ClerkTreeLogo from '../components/Brand/ClerkTreeLogo';
import ClerkTreeLockup from '../components/Brand/ClerkTreeLockup';
import Grainient from '../components/Brand/Grainient';
import { Header, Footer } from '../components/Landing/AgeroChrome';
import SEO from '../components/SEO';
import './LandingFramer.css';
import './Brand.css';

const BRAND = '/brand';

type AssetFile = { label: 'SVG' | 'PNG'; href: string; size: string };
type Variant = { name: string; note: string; tone: 'light' | 'dark'; src: string; alt: string; files: AssetFile[] };
type LogoPackage = { title: string; summary: string; kind: 'lockup' | 'mark'; variants: Variant[] };

const logoPackages: LogoPackage[] = [
  {
    title: 'Lockup',
    summary: 'The default. Use it wherever there is room for the name.',
    kind: 'lockup',
    variants: [
      {
        name: 'Black',
        note: 'on light',
        tone: 'light',
        src: `${BRAND}/clerktree-lockup-black.svg`,
        alt: 'ClerkTree lockup, black',
        files: [
          { label: 'SVG', href: `${BRAND}/clerktree-lockup-black.svg`, size: '5.4 KB' },
          { label: 'PNG', href: `${BRAND}/clerktree-lockup-black.png`, size: '48 KB' },
        ],
      },
      {
        name: 'Inverse',
        note: 'on dark',
        tone: 'dark',
        src: `${BRAND}/clerktree-lockup-inverse.svg`,
        alt: 'ClerkTree lockup, inverse',
        files: [
          { label: 'SVG', href: `${BRAND}/clerktree-lockup-inverse.svg`, size: '5.4 KB' },
          { label: 'PNG', href: `${BRAND}/clerktree-lockup-inverse.png`, size: '43 KB' },
        ],
      },
    ],
  },
  {
    title: 'Mark',
    summary: 'Compact, and only where ClerkTree is already identified.',
    kind: 'mark',
    variants: [
      {
        name: 'Black',
        note: 'on light',
        tone: 'light',
        src: `${BRAND}/clerktree-mark-black.svg`,
        alt: 'ClerkTree mark, black',
        files: [
          { label: 'SVG', href: `${BRAND}/clerktree-mark-black.svg`, size: '1.3 KB' },
          { label: 'PNG', href: `${BRAND}/clerktree-mark-black.png`, size: '37 KB' },
        ],
      },
      {
        name: 'Inverse',
        note: 'on dark',
        tone: 'dark',
        src: `${BRAND}/clerktree-mark-inverse.svg`,
        alt: 'ClerkTree mark, inverse',
        files: [
          { label: 'SVG', href: `${BRAND}/clerktree-mark-inverse.svg`, size: '1.3 KB' },
          { label: 'PNG', href: `${BRAND}/clerktree-mark-inverse.png`, size: '31 KB' },
        ],
      },
    ],
  },
];

type Misuse = { title: string; copy: string; kind: 'lockup' | 'mark'; className: string; split?: boolean };

const misuses: Misuse[] = [
  { title: 'Stretch or condense', copy: 'Scale proportionally. Never distort the lockup or mark.', kind: 'lockup', className: 'is-stretched' },
  { title: 'Rotate or redraw', copy: 'Do not rebuild the mark, change its proportions, or rotate the identity.', kind: 'mark', className: 'is-rotated' },
  { title: 'Recolor the artwork', copy: 'Use only the approved black and inverse artwork.', kind: 'mark', className: 'is-recolored' },
  { title: 'Add effects', copy: 'No shadows, glows, gradients, outlines, or containers added to the artwork.', kind: 'lockup', className: 'is-effected' },
  { title: 'Crop the artwork', copy: 'Keep the full clear-space area visible; do not clip the mark or wordmark.', kind: 'lockup', className: 'is-cropped' },
  { title: 'Recolor one element', copy: 'Mark and name always share one approved color. Signal orange never touches the logo.', kind: 'lockup', className: 'is-split', split: true },
];

type Swatch = { name: string; hex: string; token: string; role: string; light?: boolean };

const swatches: Swatch[] = [
  { name: 'Black', hex: '#000000', token: '--ct-color-black', role: 'Hero stages and full-bleed dark surfaces.' },
  { name: 'Logo', hex: '#060606', token: '--ct-color-logo', role: 'Logo artwork on light backgrounds.' },
  { name: 'Ink', hex: '#0A0A0A', token: '--ct-color-ink', role: 'Headings and primary text.' },
  { name: 'Muted', hex: '#555555', token: '--ct-color-muted', role: 'Body copy and secondary text.' },
  { name: 'Border', hex: '#C8C8C8', token: '--ct-color-border', role: 'Hairlines and dividers.', light: true },
  { name: 'Canvas', hex: '#F4F4F4', token: '--ct-color-canvas', role: 'Page background.', light: true },
  { name: 'Sunken', hex: '#EDEDED', token: '--ct-color-sunken', role: 'Inputs and inset wells.', light: true },
  { name: 'Surface', hex: '#FFFFFF', token: '--ct-color-surface', role: 'Cards, panels, the header shell and the inverse logo.', light: true },
  { name: 'Signal', hex: '#FF4D00', token: '--ct-color-signal', role: 'Accent only. Never on the logo.' },
];

type TypeStep = { name: string; spec: string; className: string };

const typeScale: TypeStep[] = [
  { name: 'Display', spec: 'Cal Sans 88/84 · -3%', className: 'is-display' },
  { name: 'Page heading', spec: 'Cal Sans 56/58 · -2%', className: 'is-page' },
  { name: 'Section heading', spec: 'Cal Sans 36/40 · -1.5%', className: 'is-section' },
  { name: 'Subheading', spec: 'Cal Sans 22/28 · -1%', className: 'is-sub' },
  { name: 'Intro', spec: 'Inter Regular 18/30 · 0', className: 'is-intro' },
  { name: 'Body', spec: 'Inter Regular 16/26 · 0', className: 'is-body' },
  { name: 'Metadata', spec: 'Inter Regular 14/20 · 0', className: 'is-meta' },
  { name: 'Eyebrow', spec: 'Inter Medium 12/16 · +8%', className: 'is-eyebrow' },
];

const TYPE_SAMPLE = 'AI harness for industrial machinery';

async function writeClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    // Clipboard API can be blocked (permissions policy, embedded frames); fall back to a hidden textarea.
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    textarea.remove();
    return ok;
  }
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (value: string, key = value) => {
    if (!(await writeClipboard(value))) return;
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1600);
  };

  return { copied, copy };
}

function absoluteUrl(path: string) {
  return typeof window === 'undefined' ? path : new URL(path, window.location.origin).toString();
}

function SectionHead({ title, copy, id }: { title: string; copy: string; id?: string }) {
  return (
    <div className="brand-section-head">
      <h2 id={id}>{title}</h2>
      <p>{copy}</p>
    </div>
  );
}

function InlineLogo({ kind }: { kind: 'lockup' | 'mark' }) {
  return (
    <span className={`brand-inline-logo is-${kind}`}>
      {kind === 'mark' ? (
        <ClerkTreeLogo markClassName="brand-inline-logo-mark" labelClassName="sr-only" />
      ) : (
        <ClerkTreeLockup className="brand-inline-lockup" title={null} />
      )}
    </span>
  );
}

export default function Brand() {
  const { copied, copy } = useCopy();

  return (
    <div className="agero-works brand-page" id="agero-works">
      <SEO
        title="Brand assets and logos"
        description="Download the ClerkTree logo, mark, colors, typography and design tokens, with guidance on how to use them."
        canonical="https://clerktree.com/brand"
      />

      <div className="agero-top-area agero-top-area-with-hero">
        <Header />

        <section className="agero-hero-stage brand-hero" aria-labelledby="brand-hero-title">
          <Grainient preset="silver" />
          <div className="brand-hero-content">
            <img className="brand-hero-lockup" src={`${BRAND}/clerktree-lockup-inverse.svg`} alt="ClerkTree" width={300} height={65} />
            <h1 id="brand-hero-title">The ClerkTree brand</h1>
            <p>We make industrial operations legible. Our identity should be too.</p>
            <p className="brand-hero-sub">Everything here is ready to use as it is. Please don't redraw it.</p>
          </div>
          <a className="brand-hero-cue" href="#assets">
            Assets
            <ArrowDown size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
        </section>
      </div>

      <main className="brand-main">
        {/* Logo */}
        <section className="brand-band brand-band-light" id="assets" aria-labelledby="brand-logo-title">
          <div className="brand-band-inner brand-split">
            <SectionHead
              id="brand-logo-title"
              title="Logo"
              copy="Two packages. The lockup is the default; the mark is for compact, already-identified ClerkTree contexts."
            />

            <div className="brand-split-body">
              {logoPackages.map((pkg) => (
                <section className="brand-pkg" key={pkg.title} aria-label={pkg.title}>
                  <header className="brand-pkg-head">
                    <h3>{pkg.title}</h3>
                    <p>{pkg.summary}</p>
                  </header>
                  <div className="brand-variant-grid">
                    {pkg.variants.map((variant) => (
                      <figure className="brand-variant" key={variant.src}>
                        <div className={`brand-stage is-${variant.tone} is-${pkg.kind}`}>
                          <img src={variant.src} alt={variant.alt} loading="lazy" decoding="async" />
                        </div>
                        <figcaption>
                          <p className="brand-variant-name">
                            {variant.name} <span>{variant.note}</span>
                          </p>
                          <div className="brand-downloads">
                            <span>Download</span>
                            {variant.files.map((file) => (
                              <a key={file.href} href={file.href} download>
                                <strong>{file.label}</strong> {file.size}
                              </a>
                            ))}
                          </div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </section>
              ))}

              <div className="brand-rules-grid">
                <figure className="brand-rule">
                  <div className="brand-stage is-light brand-clearspace">
                    <div className="brand-clearspace-box">
                      <img src={`${BRAND}/clerktree-lockup-black.svg`} alt="" />
                      <span className="brand-clearspace-x" aria-hidden="true">X</span>
                    </div>
                  </div>
                  <figcaption>
                    <p className="brand-variant-name">Clear space</p>
                    <p>Keep at least 1X around every side.</p>
                    <p>X equals half the height of the mark.</p>
                    <p>Never let text, edges, or imagery enter this area. The shaded band is 1X.</p>
                  </figcaption>
                </figure>

                <figure className="brand-rule">
                  <div className="brand-stage is-light brand-minsize">
                    <div>
                      <img src={`${BRAND}/clerktree-lockup-black.svg`} alt="" style={{ width: 120 }} />
                      <span>Lockup · 120px</span>
                    </div>
                    <div>
                      <img src={`${BRAND}/clerktree-mark-black.svg`} alt="" style={{ width: 24 }} />
                      <span>Mark · 24px</span>
                    </div>
                  </div>
                  <figcaption>
                    <p className="brand-variant-name">Minimum size</p>
                    <p>Both shown at actual size. Below these widths the mark's eye closes up and the wordmark fills in.</p>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Misuse */}
        <section className="brand-band brand-band-dark" aria-labelledby="brand-misuse-title">
          <div className="brand-band-inner brand-split">
            <SectionHead id="brand-misuse-title" title="Misuse" copy="Each specimen below shows the thing not to do." />

            <div className="brand-misuse-grid">
              {misuses.map((item) => (
                <figure className="brand-misuse" key={item.title}>
                  <div className={`brand-misuse-stage ${item.className}`}>
                    <InlineLogo kind={item.kind} />
                    <span className="brand-misuse-badge" aria-hidden="true">
                      <X size={11} strokeWidth={3} />
                    </span>
                  </div>
                  <figcaption>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Color */}
        <section className="brand-band brand-band-light brand-band-color" aria-labelledby="brand-color-title">
          <div className="brand-band-inner">
            <SectionHead
              id="brand-color-title"
              title="Color"
              copy="Greyscale does the work; signal orange marks what matters. Click any swatch to copy it."
            />
          </div>
          <div className="brand-swatches">
            {swatches.map((swatch, index) => {
              const isCopied = copied === swatch.hex;
              return (
                <button
                  className={`brand-swatch${swatch.light ? ' is-light' : ''}`}
                  key={swatch.token}
                  onClick={() => copy(swatch.hex)}
                  style={{ background: swatch.hex, '--i': index } as CSSProperties}
                  title={`${swatch.name} — ${swatch.role}`}
                  type="button"
                  aria-label={`Copy ${swatch.name} ${swatch.hex}`}
                >
                  <span className="brand-swatch-name">{swatch.name}</span>
                  <span className="brand-swatch-hex">{isCopied ? 'Copied' : swatch.hex}</span>
                  <span className="brand-swatch-token">{swatch.token}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Typography */}
        <section className="brand-band brand-band-dark" aria-labelledby="brand-type-title">
          <div className="brand-band-inner brand-split">
            <SectionHead
              id="brand-type-title"
              title="Typography"
              copy="Cal Sans sets every heading; Inter carries everything else. The page you are reading is set in the scale below."
            />

            <div className="brand-split-body">
              <div className="brand-type-specimens">
                <div className="brand-type-card is-display-face">
                  <span className="brand-type-glyphs">Cal Sans</span>
                  <div className="brand-type-card-foot">
                    <p>Headings and display. One weight.</p>
                    <a href="https://fonts.google.com/specimen/Cal+Sans" target="_blank" rel="noopener noreferrer">
                      Free · Google Fonts
                    </a>
                  </div>
                </div>
                <div className="brand-type-card is-text-face">
                  <span className="brand-type-glyphs">Inter</span>
                  <div className="brand-type-card-foot">
                    <p>Body, interface and data. Regular and Medium.</p>
                    <a href="https://fonts.google.com/specimen/Inter" target="_blank" rel="noopener noreferrer">
                      Free · Google Fonts
                    </a>
                  </div>
                </div>
              </div>

              <div className="brand-type-scale">
                <p className="brand-type-scale-label">Scale</p>
                {typeScale.map((step) => (
                  <div className="brand-type-row" key={step.name}>
                    <div className="brand-type-meta">
                      <span>{step.name}</span>
                      <span>{step.spec}</span>
                    </div>
                    <p className={`brand-type-sample ${step.className}`}>{TYPE_SAMPLE}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Using this guide */}
        <section className="brand-band brand-band-light" aria-labelledby="brand-guide-title">
          <div className="brand-band-inner brand-split">
            <SectionHead
              id="brand-guide-title"
              title="Using this guide"
              copy="The two things you need to use any of this: the values in a form your tools can read, and the limits on what you may do with them."
            />

            <div className="brand-split-body">
              <h3 className="brand-guide-h3">Design tokens</h3>
              <p className="brand-guide-intro">
                Fetch these rather than reading values off a screenshot or inferring them from our CSS. Every color, size and
                radius on this page is in them, under a stable URL.
              </p>

              {[
                {
                  path: `${BRAND}/tokens.json`,
                  badge: 'JSON',
                  icon: FileJson,
                  copy: 'W3C Design Tokens format, so Style Dictionary and Figma variables read it unmodified. Color, type, radius and logo rules sit in standard token groups.',
                },
                {
                  path: `${BRAND}/tokens.css`,
                  badge: 'CSS',
                  icon: FileCode2,
                  copy: 'The same values as CSS custom properties, ready to paste.',
                },
              ].map(({ path, badge, icon: Icon, copy: description }) => (
                <div className="brand-token-card" key={path}>
                  <div className="brand-token-card-head">
                    <a href={path} target="_blank" rel="noopener noreferrer">
                      <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                      {path}
                    </a>
                    <div className="brand-token-card-actions">
                      <span className="brand-token-badge">{badge}</span>
                      <button
                        type="button"
                        className="brand-icon-button"
                        onClick={() => copy(absoluteUrl(path), path)}
                        aria-label={`Copy URL for ${path}`}
                      >
                        {copied === path ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <p>{description}</p>
                </div>
              ))}

              <h3 className="brand-guide-h3 is-spaced">Usage standard</h3>
              <p className="brand-guide-intro">
                Do not modify the logo, imply endorsement or partnership, or use ClerkTree assets in unlawful, deceptive, or
                misleading contexts. For an exception, contact the ClerkTree team before publication.
              </p>

              <a className="brand-contact-card" href="mailto:team@clerktree.com">
                <Mail size={18} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  <span>Questions, or an exception to ask for?</span>
                  <strong>team@clerktree.com</strong>
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
