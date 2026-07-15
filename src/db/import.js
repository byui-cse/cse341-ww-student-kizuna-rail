import { closeDb, connectToDb } from './connect.js';
import trips from './seeds/trips.json' with { type: 'json' };
import schedules from './seeds/schedules.json' with { type: 'json' };
import stations from './seeds/stations.json' with { type: 'json' };
import ticketClasses from './seeds/ticket-classes.json' with { type: 'json' };
import trains from './seeds/trains.json' with { type: 'json' };

const collections = [
  ['trips', trips],
  ['schedules', schedules],
  ['stations', stations],
  ['ticketClasses', ticketClasses],
  ['trains', trains]
];

const importDatabase = async () => {
  const db = await connectToDb();

  for (const [collectionName, documents] of collections) {
    const collection = db.collection(collectionName);
    await collection.deleteMany({});
    await collection.insertMany(documents);
    console.log(`Imported ${documents.length} documents into ${collectionName}.`);
  }

  await db.collection('confirmations').deleteMany({});
  await db.collection('confirmations').createIndex({ id: 1 }, { unique: true });
  console.log('Cleared confirmations.');
};

try {
  await importDatabase();
  console.log('MongoDB import complete.');
} finally {
  await closeDb();
}
