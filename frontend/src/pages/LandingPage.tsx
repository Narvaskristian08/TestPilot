import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  PlayIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    eyebrow: 'Coverage',
    title: 'One URL. Ten quality checks.',
    description:
      'Run a focused QA pass across the issues that quietly turn good releases into support tickets.',
    icon: GlobeAltIcon,
  },
  {
    eyebrow: 'Evidence',
    title: 'See what failed and why.',
    description:
      'Get readable results, screenshots, traces, and failure context your team can act on immediately.',
    icon: ChartBarIcon,
  },
  {
    eyebrow: 'Speed',
    title: 'Feedback while the work is fresh.',
    description:
      'Watch checks run live, catch regressions earlier, and keep shipping without waiting for a manual pass.',
    icon: BoltIcon,
  },
];

function LogoMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-700 bg-zinc-100 text-zinc-950">
      <ShieldCheckIcon className="h-5 w-5" />
    </span>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [targetUrl, setTargetUrl] = useState('');
  const [error, setError] = useState('');

  const startAudit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = targetUrl.trim();

    if (!value) {
      setError('Enter a website URL to start your audit.');
      return;
    }

    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Unsupported protocol');
      }
    } catch {
      setError('Use a valid URL that starts with http:// or https://.');
      return;
    }

    setError('');
    navigate(`/dashboard?target=${encodeURIComponent(value)}`);
  };

  const tryExample = () => {
    navigate('/dashboard?target=https%3A%2F%2Fexample.com');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-noir-bg text-noir-text-primary selection:bg-zinc-700/40">

      <header className="relative z-10 border-b border-noir-border bg-noir-secondary/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="TestPilot home">
            <LogoMark />
            <span>
            <span className="block text-sm font-semibold tracking-[0.24em] text-noir-text-primary">NOIR</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">QA automation</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex" aria-label="Primary navigation">
            <a className="transition-colors hover:text-white" href="#coverage">Coverage</a>
            <a className="transition-colors hover:text-white" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-white" href="#features">Why TestPilot</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:block">
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-md border border-noir-border bg-noir-surface px-3.5 py-2 text-sm font-medium text-noir-text-primary transition hover:border-zinc-500 hover:bg-noir-elevated"
            >
              Open dashboard
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-20 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10 lg:pb-32 lg:pt-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-noir-border bg-noir-surface px-3.5 py-2 text-xs font-medium uppercase tracking-[0.16em] text-noir-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
              Automated QA for every deploy
            </div>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-noir-text-primary sm:text-6xl lg:text-7xl">
              Ship with confidence.
              <span className="mt-2 block text-noir-text-secondary">
                Catch regressions early.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-400 sm:text-xl">
              TestPilot turns a website URL into a fast, evidence-backed QA report—so your team can fix what matters before users find it.
            </p>

            <form onSubmit={startAudit} className="mt-9 max-w-xl rounded-lg border border-noir-border bg-noir-surface p-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex min-w-0 flex-1 items-center gap-3 rounded-md bg-noir-secondary px-4 py-3.5 ring-1 ring-inset ring-noir-border focus-within:ring-zinc-500/40">
                  <GlobeAltIcon className="h-5 w-5 shrink-0 text-noir-text-secondary" />
                  <span className="sr-only">Website URL</span>
                  <input
                    value={targetUrl}
                    onChange={(event) => {
                      setTargetUrl(event.target.value);
                      if (error) setError('');
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm text-noir-text-primary outline-none placeholder:text-noir-text-muted"
                    placeholder="https://your-website.com"
                    inputMode="url"
                    autoComplete="url"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-noir-text-primary px-5 py-3.5 text-sm font-semibold text-noir-bg transition hover:bg-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500/40"
                >
                  Run free audit
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              {error ? <p className="px-3 pb-1 pt-2 text-xs text-rose-300">{error}</p> : null}
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-noir-text-muted">
              <span className="inline-flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-success-500" />3 free guest runs</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircleIcon className="h-4 w-4 text-success-500" />No setup required</span>
              <button type="button" onClick={tryExample} className="text-noir-text-secondary transition-colors hover:text-noir-text-primary">Try example.com →</button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto" aria-label="TestPilot dashboard preview">
            <div className="relative rounded-lg border border-noir-border bg-noir-surface p-3">
              <div className="rounded-md border border-noir-border bg-noir-secondary p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-noir-border pb-5">
                  <div className="flex items-center gap-3">
                    <LogoMark />
                    <div>
                      <p className="text-sm font-semibold text-noir-text-primary">Run overview</p>
                      <p className="mt-0.5 text-xs text-noir-text-muted font-mono">example.com · just now</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-success-500/20 bg-success-500/10 px-2.5 py-1 text-[11px] font-medium text-success-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Healthy
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 py-5">
                  <div className="rounded-md border border-noir-border bg-noir-surface p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-noir-text-muted">Checks</p>
                    <p className="mt-2 text-2xl font-semibold text-noir-text-primary">10</p>
                    <p className="mt-1 text-[11px] text-success-500">All complete</p>
                  </div>
                  <div className="rounded-md border border-noir-border bg-noir-surface p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-noir-text-muted">Passed</p>
                    <p className="mt-2 text-2xl font-semibold text-noir-text-primary">98.4%</p>
                    <p className="mt-1 text-[11px] text-noir-text-muted">Confidence score</p>
                  </div>
                  <div className="rounded-md border border-noir-border bg-noir-surface p-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-noir-text-muted">Duration</p>
                    <p className="mt-2 text-2xl font-semibold text-noir-text-primary">42s</p>
                    <p className="mt-1 text-[11px] text-noir-text-muted">End-to-end</p>
                  </div>
                </div>

                <div className="rounded-md border border-noir-border bg-noir-surface p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-noir-text-primary">Quality signal</p>
                      <p className="mt-1 text-[11px] text-noir-text-muted">Latest run by check type</p>
                    </div>
                    <ChartBarIcon className="h-5 w-5 text-noir-text-secondary" />
                  </div>
                  <div className="flex h-24 items-end gap-2">
                    {[42, 57, 49, 72, 64, 82, 92, 76, 97, 88, 100, 93].map((height, index) => (
                      <div key={index} className="flex-1 rounded-t-sm bg-zinc-500" style={{ height: `${height}%` }} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-noir-text-muted"><span>Start</span><span>Live result stream</span><span>Complete</span></div>
                </div>

                <div className="mt-4 space-y-2">
                  {['Page availability', 'Accessibility scan', 'Responsive design'].map((check, index) => (
                    <div key={check} className="flex items-center justify-between rounded-md border border-noir-border bg-noir-secondary px-3 py-2.5">
                      <span className="flex items-center gap-2 text-xs text-noir-text-secondary"><CheckCircleIcon className="h-4 w-4 text-success-500" />{check}</span>
                      <span className="text-[11px] text-noir-text-muted font-mono">{index === 1 ? '1.8s' : index === 2 ? '3.4s' : '0.6s'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="coverage" className="border-y border-noir-border bg-noir-secondary">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-7 sm:grid-cols-3 sm:px-8 lg:px-10">
            {[
              ['10', 'automated checks in one run'],
              ['3', 'responsive viewports covered'],
              ['1', 'clear report your team can act on'],
            ].map(([value, label]) => (
              <div key={label} className="flex items-center gap-4 sm:justify-center sm:border-r sm:border-noir-border last:sm:border-0">
                <span className="text-3xl font-semibold tracking-[-0.05em] text-noir-text-primary">{value}</span>
                <span className="max-w-[10rem] text-xs leading-5 text-noir-text-muted">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-noir-text-secondary">Quality without the ceremony</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-noir-text-primary sm:text-4xl">Make every release feel tested.</h2>
            <p className="mt-4 text-base leading-7 text-noir-text-muted">TestPilot gives lean teams the fast feedback loop of a dedicated QA crew, without another toolchain to maintain.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="group rounded-lg border border-noir-border bg-noir-surface p-6 transition-colors hover:border-zinc-500 hover:bg-noir-elevated">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-noir-text-muted">{feature.eyebrow}</span>
                  <feature.icon className="h-5 w-5 text-noir-text-secondary transition-transform group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-12 text-xl font-semibold tracking-[-0.025em] text-noir-text-primary">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-noir-text-muted">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-noir-border bg-noir-secondary">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-28">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-noir-text-secondary">How it works</p>
              <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-[-0.04em] text-noir-text-primary sm:text-4xl">From URL to useful signal in minutes.</h2>
              <p className="mt-4 max-w-md text-base leading-7 text-noir-text-muted">No scripts to write. No browser matrix to configure. Just point TestPilot at the experience you want to protect.</p>
              <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-noir-text-secondary transition-colors hover:text-noir-text-primary">
                See your dashboard
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                ['01', 'Point at a deployment', 'Enter the public URL for the site or environment you want to check.'],
                ['02', 'Let the checks run', 'TestPilot safely exercises the page across availability, UX, accessibility, and security signals.'],
                ['03', 'Fix with confidence', 'Review the report, open evidence, and share the exact issue with the person who can fix it.'],
              ].map(([number, title, description]) => (
                <div key={number} className="flex gap-5 rounded-lg border border-noir-border bg-noir-surface p-5 sm:p-6">
                  <span className="font-mono text-sm text-noir-text-secondary">{number}</span>
                  <div>
                    <h3 className="font-semibold text-noir-text-primary">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-noir-text-muted">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="relative overflow-hidden rounded-lg border border-noir-border bg-noir-surface px-6 py-12 text-center sm:px-10">
            <SparklesIcon className="mx-auto h-7 w-7 text-noir-text-secondary" />
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-noir-text-primary sm:text-4xl">Your next release starts with a clean report.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-noir-text-secondary">Run your first audit free. See the signal, share the evidence, and ship the fix.</p>
            <Link to="/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-md bg-noir-text-primary px-5 py-3 text-sm font-semibold text-noir-bg transition hover:bg-zinc-200">
              Start testing
              <PlayIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-noir-border px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-noir-text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2"><LogoMark /><span>© 2026 TestPilot. QA that keeps up.</span></div>
          <div className="flex gap-5"><Link to="/login" className="transition-colors hover:text-zinc-300">Sign in</Link><Link to="/register" className="transition-colors hover:text-zinc-300">Create account</Link></div>
        </div>
      </footer>
    </div>
  );
}
