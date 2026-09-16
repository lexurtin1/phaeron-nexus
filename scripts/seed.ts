import { ensureWorldBooted } from "@/server/seed/bootstrap";

async function main() {
  const world = await ensureWorldBooted({ forceReseed: true });
  console.log(
    `[nexus] seeded ${world.organisations.length} orgs, ${world.tasks.length} tasks, ${world.notes.length} notes`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
