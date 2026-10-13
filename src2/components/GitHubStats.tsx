import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useGitHubDataset } from '../../shared/github/useGitHubDataset';
import { usePortfolio } from '../../src/hooks/PortfolioContext';
import Section, { SectionPending } from './Section';
import { ActivityStrip, CommitsByRepo, LanguageRanks } from './GitHubChart';
import { ink, leading, onScroll, rule } from '../motion';

const GitHubStats = () => {
  const { dataset, isLoading } = useGitHubDataset();
  const { portfolio } = usePortfolio();
  const { totals } = dataset;
  const stats = portfolio?.githubStats as { contributionsSince?: number; contributionsAsOf?: string } | undefined;
  const since = stats?.contributionsSince;
  const asOf = stats?.contributionsAsOf;
  const asOfLabel = asOf
    ? new Date(`${asOf}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const figures = [
    { label: 'Repositories', value: String(totals.repos) },
    { label: since ? `Commits since ${since}` : 'Commits', value: totals.commitsLabel },
    { label: 'Stars', value: String(totals.stars) },
    { label: 'Forks', value: String(totals.forks) },
  ];

  return (
    <Section id="github-stats" label="GitHub">
      {isLoading ? (
        <SectionPending />
      ) : !dataset.hasData ? (
        <p className="text-muted-foreground">No GitHub statistics available yet.</p>
      ) : (
        <motion.div variants={leading(0.12)} {...onScroll}>
          <motion.p variants={ink} className="text-muted-foreground">
            The public record: what I build in the open, measured rather than described.
          </motion.p>

          <motion.dl variants={ink} className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-[0.85fr_1.45fr_0.85fr_0.85fr]">
            {figures.map((f) => (
              <div key={f.label} className="sm:border-l sm:border-border sm:pl-5 sm:first:border-l-0 sm:first:pl-0">
                <dt className="t2-meta">{f.label}</dt>
                <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{f.value}</dd>
              </div>
            ))}
          </motion.dl>
          {asOfLabel && (
            <motion.p variants={ink} className="t2-meta mt-4">
              Counts as of <span className="t2-num">{asOfLabel}</span>.
            </motion.p>
          )}

          <motion.span variants={rule} aria-hidden="true" className="my-10 block h-px origin-left bg-border" />

          {dataset.repos.length > 0 && (
            <motion.div variants={ink}>
              <CommitsByRepo repos={dataset.repos.slice(0, 8)} />
            </motion.div>
          )}

          <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-10">
            {dataset.languages.length > 0 && (
              <motion.div variants={ink}>
                <LanguageRanks languages={dataset.languages.slice(0, 6)} />
              </motion.div>
            )}
            {dataset.contributions.length > 0 && (
              <motion.div variants={ink}>
                <ActivityStrip points={dataset.contributions} />
              </motion.div>
            )}
          </div>

          {/* Table twin of the charts above */}
          <details className="group mt-10 border-t border-border pt-2">
            <summary className="t2-meta flex cursor-pointer list-none items-center gap-2 py-3 uppercase tracking-[0.12em] hover:text-foreground">
              <span className="inline-block transition-transform group-open:rotate-90">›</span>
              View as table
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="t2-meta uppercase">
                  <tr className="border-b border-border">
                    <th scope="col" className="py-2 pr-4 font-medium">Repository</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Language</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">Commits</th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">Stars</th>
                    <th scope="col" className="py-2 text-right font-medium">Forks</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {dataset.repos.map((r) => (
                    <tr key={r.name} className="border-b border-border/60">
                      <td className="py-2 pr-4">{r.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.language}</td>
                      <td className="py-2 pr-4 text-right">{r.commits}</td>
                      <td className="py-2 pr-4 text-right">{r.stars}</td>
                      <td className="py-2 text-right">{r.forks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {dataset.profileUrl && (
            <a
              href={dataset.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-primary"
            >
              github.com/{dataset.username}
              <ArrowUpRight size={15} className="t2-arrow" aria-hidden="true" />
            </a>
          )}
        </motion.div>
      )}
    </Section>
  );
};

export default GitHubStats;
