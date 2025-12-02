import { PrismaClient } from '../.prisma/client/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

// Book of John verse counts by chapter
const johnVerseCounts = [
  51, // Chapter 1
  25, // Chapter 2
  36, // Chapter 3
  54, // Chapter 4
  47, // Chapter 5
  71, // Chapter 6
  53, // Chapter 7
  59, // Chapter 8
  41, // Chapter 9
  42, // Chapter 10
  57, // Chapter 11
  50, // Chapter 12
  38, // Chapter 13
  31, // Chapter 14
  27, // Chapter 15
  33, // Chapter 16
  26, // Chapter 17
  40, // Chapter 18
  42, // Chapter 19
  31, // Chapter 20
  25, // Chapter 21
];

async function populateJohn() {
  try {
    console.log('Starting to populate Book of John...');

    // Check if John resource exists, create if not
    let johnResource = await prisma.resource.findFirst({
      where: { name: 'John' },
    });

    if (!johnResource) {
      console.log('Creating John resource...');
      johnResource = await prisma.resource.create({
        data: {
          name: 'John',
          type: 'Book',
          series: 'Bible',
        },
      });
      console.log(`Created John resource with ID: ${johnResource.id}`);
    } else {
      console.log(`Found existing John resource with ID: ${johnResource.id}`);
    }

    const resourceId = johnResource.id;

    // Check existing chapters
    const existingChapters = await prisma.chapter.findMany({
      where: { resourceId },
      orderBy: { number: 'asc' },
    });

    console.log(`Found ${existingChapters.length} existing chapters`);

    // Create chapters and verses
    for (let chapterNum = 1; chapterNum <= 21; chapterNum++) {
      const existingChapter = existingChapters.find((c) => c.number === chapterNum);

      let chapter;
      if (existingChapter) {
        console.log(`Chapter ${chapterNum} already exists, skipping...`);
        chapter = existingChapter;
      } else {
        console.log(`Creating Chapter ${chapterNum}...`);
        chapter = await prisma.chapter.create({
          data: {
            resourceId,
            number: chapterNum,
            name: `Chapter ${chapterNum}`,
          },
        });
      }

      // Check existing verses for this chapter
      const existingVerses = await prisma.verse.findMany({
        where: { chapterId: chapter.id },
        orderBy: { number: 'asc' },
      });

      if (existingVerses.length > 0) {
        console.log(
          `  Chapter ${chapterNum} already has ${existingVerses.length} verses, skipping...`
        );
        continue;
      }

      // Create verses for this chapter
      const verseCount = johnVerseCounts[chapterNum - 1];
      console.log(`  Creating ${verseCount} verses for Chapter ${chapterNum}...`);

      const verseData = Array.from({ length: verseCount }, (_, i) => ({
        chapterId: chapter.id,
        number: i + 1,
      }));

      // Create verses in batches to avoid overwhelming the database
      const batchSize = 50;
      for (let i = 0; i < verseData.length; i += batchSize) {
        const batch = verseData.slice(i, i + batchSize);
        await prisma.verse.createMany({
          data: batch,
        });
      }

      console.log(`  ✓ Created ${verseCount} verses for Chapter ${chapterNum}`);
    }

    console.log('\n✓ Successfully populated Book of John!');
    console.log(`  - Resource: John (ID: ${resourceId})`);
    console.log(`  - Chapters: 21`);

    // Count total verses
    const totalVerses = await prisma.verse.count({
      where: {
        chapter: {
          resourceId,
        },
      },
    });
    console.log(`  - Total Verses: ${totalVerses}`);
  } catch (error) {
    console.error('Error populating John:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

populateJohn()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
