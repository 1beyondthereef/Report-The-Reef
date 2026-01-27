import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { anchoragesData } from "./seed-data/anchorages";

const adapter = new PrismaLibSql({
  url: "file:dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  console.log("Clearing existing anchorages and moorings...");
  await prisma.mooring.deleteMany();
  await prisma.anchorage.deleteMany();

  // Seed anchorages and moorings
  console.log("Seeding anchorages...");

  let totalMoorings = 0;

  for (const anchorage of anchoragesData) {
    console.log("  Creating: " + anchorage.name);

    const createdAnchorage = await prisma.anchorage.create({
      data: {
        name: anchorage.name,
        description: anchorage.description,
        latitude: anchorage.latitude,
        longitude: anchorage.longitude,
        island: anchorage.island,
        depth: anchorage.depth,
        holding: anchorage.holding,
        protection: anchorage.protection,
        capacity: anchorage.capacity,
        amenities: JSON.stringify(anchorage.amenities),
        images: JSON.stringify(anchorage.images),
        hasReef: anchorage.sensitiveHabitat.hasReef,
        hasSeagrass: anchorage.sensitiveHabitat.hasSeagrass,
        habitatWarning: anchorage.sensitiveHabitat.warning,
      },
    });

    // Create moorings for this anchorage
    for (const mooring of anchorage.moorings) {
      await prisma.mooring.create({
        data: {
          anchorageId: createdAnchorage.id,
          name: mooring.name,
          latitude: anchorage.latitude + (Math.random() - 0.5) * 0.002,
          longitude: anchorage.longitude + (Math.random() - 0.5) * 0.002,
          maxLength: mooring.maxLength,
          maxWeight: mooring.maxWeight,
          pricePerNight: mooring.pricePerNight,
          notes: mooring.notes,
          isActive: true,
        },
      });
      totalMoorings++;
    }

    console.log("    Created " + anchorage.moorings.length + " moorings");
  }

  console.log("\nSeed completed successfully!");
  console.log("Created " + anchoragesData.length + " anchorages");
  console.log("Created " + totalMoorings + " moorings");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
