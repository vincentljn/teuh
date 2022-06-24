import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "test@test.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("test", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const job1 = await prisma.job.create({
    data: {
      name: "DEVELOPER",
      value: 40000,
      order: 1
    },
  });

  const job2 = await prisma.job.create({
    data: {
      name: "DATA_SCIENTIST",
      value: 50000,
      order: 2
    },
  });

  await prisma.job.create({
    data: {
      name: "HR",
      value: 35000,
      order: 3
    },
  });

  await prisma.job.create({
    data: {
      name: "SUPPORT",
      value: 30000,
      order: 4
    },
  });

  const experience1 = await prisma.experience.create({
    data: {
      name: "TRAINEE",
      value: 1,
      order: 1
    },
  });

  const experience2 = await prisma.experience.create({
    data: {
      name: "JUNIOR",
      value: 1.2,
      order: 2
    },
  });

  await prisma.experience.create({
    data: {
      name: "MIDDLE",
      value: 1.4,
      order: 3
    },
  });

  await prisma.experience.create({
    data: {
      name: "SENIOR",
      value: 1.6,
      order: 4
    },
  });

  const seniority1 = await prisma.seniority.create({
    data: {
      name: "NEWBEE",
      value: 0,
      order: 1
    },
  });

  const seniority2 = await prisma.seniority.create({
    data: {
      name: "JUNIOR",
      value: 1000,
      order: 2
    },
  });

  await prisma.seniority.create({
    data: {
      name: "MIDDLE",
      value: 2000,
      order: 3
    },
  });

  await prisma.seniority.create({
    data: {
      name: "SENIOR",
      value: 3000,
      order: 4
    },
  });

  await prisma.simulation.create({
    data: {
      name: "My first simulation",
      jobId: job1.id,
      experienceId: experience1.id,
      seniorityId: seniority1.id,
      salary: 20000,
      userId: user.id,
    },
  });

  await prisma.simulation.create({
    data: {
      name: "My second simulation",
      jobId: job2.id,
      experienceId: experience2.id,
      seniorityId: seniority2.id,
      salary: 20000,
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
