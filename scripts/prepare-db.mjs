// Runs before `next build`. On Vercel it syncs the database schema and loads the
// starter catalogue into an empty database. Locally it does nothing.
import { execSync } from "node:child_process";

if (!process.env.VERCEL) process.exit(0);

if (!process.env.DATABASE_URL) {
  console.error(
    "\n✖ DATABASE_URL is not set.\n" +
      "  In Vercel: Project → Storage → Create Database → Neon (Postgres), connect it to this project,\n" +
      "  then redeploy. See README → Deploying to Vercel.\n",
  );
  process.exit(1);
}

const run = (cmd, env = {}) => execSync(cmd, { stdio: "inherit", env: { ...process.env, ...env } });

// Never pass --accept-data-loss: a destructive schema change should stop the deploy, not drop data.
run("npx prisma db push --skip-generate");
run("npx tsx prisma/seed.ts", { SEED_ONLY_IF_EMPTY: "1", SEED_DEMO_DATA: "0" });
