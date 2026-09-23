import Link from "next/link";

const MODULES = [
  {
    href: "/tasks",
    kicker: "Work",
    title: "Task Dashboard",
    copy: "Review open and completed work, then mark a task done or pending.",
  },
  {
    href: "/activity",
    kicker: "Log",
    title: "Activity Feed",
    copy: "Search actions recorded in the workspace and see when they happened.",
  },
  {
    href: "/reports",
    kicker: "Summary",
    title: "Reports",
    copy: "See total tasks, how they split by status, and how much activity is on record.",
  },
];

export default function HomePage() {
  return (
    <main className="stack">
      <header className="hero">
        <p className="eyebrow">Workspace</p>
        <h1>Taskline</h1>
        <p className="lede">Tasks, activity, and summary counts in one quiet place.</p>
      </header>

      <section className="module-grid" aria-label="Modules">
        {MODULES.map((module) => (
          <Link key={module.href} href={module.href} className="card module-card">
            <p className="eyebrow">{module.kicker}</p>
            <h2>{module.title}</h2>
            <p>{module.copy}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
