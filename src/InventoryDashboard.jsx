import React, { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';
import { Link } from 'react-router-dom';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

export default function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    client
      .fetch(`*[_type == "inventory"] | order(location asc) {
        _id,
        count,
        location,
        gearProfile->{
          _id,
          name,
          defaultImage
        }
      }`)
      .then(setInventory)
      .catch((err) => console.error('Error loading inventory:', err));
  }, []);

  const groupedByLocation = inventory.reduce((acc, item) => {
    if (!acc[item.location]) acc[item.location] = [];
    acc[item.location].push(item);
    return acc;
  }, {});

  if (inventory.length === 0) {
    return <p className="p-6 text-gray-500">Loading inventory...</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory by Studio</h1>
      {Object.entries(groupedByLocation).map(([loc, items]) => (
        <div key={loc} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{loc.replace('-', '/').toUpperCase()}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item._id} className="border p-3 rounded shadow bg-white">
                {item.gearProfile?.defaultImage ? (
                  <img
                    src={urlFor(item.gearProfile.defaultImage).width(300).url()}
                    alt={item.gearProfile.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 text-gray-500 flex items-center justify-center mb-2">
                    No Image
                  </div>
                )}
                <p><strong>Profile:</strong> {item.gearProfile?.name || 'Unknown'}</p>
                <p><strong>Count:</strong> {item.count}</p>
                {item.gearProfile?._id && (
                  <Link
                    to={`/gear/${item.gearProfile._id}`}
                    className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                  >
                    View Detail →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}