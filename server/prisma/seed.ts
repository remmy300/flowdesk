import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@flowdesk.dev" },
    update: {},
    create: {
      name: "Alice Johnson",
      email: "alice@flowdesk.dev",
      googleId: "seed-alice",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@flowdesk.dev" },
    update: {},
    create: {
      name: "Bob Chen",
      email: "bob@flowdesk.dev",
      googleId: "seed-bob",
    },
  });

  const project = await prisma.project.upsert({
    where: { id: "seed-project" },
    update: {},
    create: {
      id: "seed-project",
      name: "FlowDesk Launch",
      description: "Ship the project management app to production.",
      color: "#6366f1",
      ownerId: alice.id,
      members: {
        create: [{ userId: alice.id, role: "OWNER" }, { userId: bob.id, role: "MEMBER" }],
      },
    },
  });

  const tasks = [
    { title: "Design database schema", description: "Users, projects, tasks, comments.", priority: "HIGH" as const, assigneeId: alice.id },
    { title: "Build auth flow", description: "JWT auth with httpOnly cookies.", priority: "URGENT" as const, assigneeId: alice.id },
    { title: "Create kanban board", description: "Drag and drop tasks between columns.", priority: "HIGH" as const, assigneeId: bob.id },
    { title: "Write documentation", description: "README + setup guide.", priority: "LOW" as const, assigneeId: bob.id },
    { title: "Fix notification badge", priority: "MEDIUM" as const },
  ];

  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    await prisma.task.create({
      data: {
        title: t.title,
        description: t.description ?? null,
        priority: t.priority,
        status: i === 2 ? "IN_PROGRESS" : i < 2 ? "DONE" : "TODO",
        position: i,
        projectId: project.id,
        assigneeId: t.assigneeId ?? null,
        createdById: alice.id,
      },
    });
  }

  console.log("Seed complete. Demo users: alice@flowdesk.dev, bob@flowdesk.dev (Google login)");
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(() => prisma.$disconnect());
