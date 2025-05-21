// scripts/deleteAllBookings.js
import { client } from '/Users/nico/Desktop/apps/lighting-gear-app/sanityClient.js'; // adjust path if needed

async function deleteAllBookings() {
  const docs = await client.fetch(`*[_type == "booking"]{ _id }`);

  if (!docs.length) {
    console.log('✅ No bookings found.');
    return;
  }

  console.log(`🗑️ Found ${docs.length} bookings. Deleting...`);

  for (const doc of docs) {
    await client.delete(doc._id);
    console.log(`Deleted: ${doc._id}`);
  }

  console.log('✅ All bookings deleted.');
}

deleteAllBookings().catch((err) => {
  console.error('❌ Error deleting bookings:', err.message);
});