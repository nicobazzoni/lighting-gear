import React, { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

const unitTypes = [
  'Daylights', 'Lustr', 'Rush Movers', 'Freedom PARs', 'Mac Auras',
  'AX1Os', 'AX9s', 'AX50s', 'Pavo Tubes', 'Makeup Kits',
  'Lyras', 'Pixel Bricks', 'AX3s', 'Forza 150s', 
  'S60s', 'S30s', 'Aadyntech Jabs','Aadyntech Punches'
];

export default function GearList() {
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    client.fetch(`*[_type == "gearType"] | order(name asc) {
      _id,
      name,
      count,
      status,
      defaultImage,
      description
    }`)
    .then(setTypes)
    .catch((err) => console.error('Failed to load gear types:', err));
  }, []);

  const toggleFilter = (name) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((t) => t !== name)
        : [...prev, name]
    );
  };

  const filtered = selected.length
    ? types.filter((t) => selected.includes(t.name))
    : [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Road Gear by Profile</h1>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {unitTypes.map((name) => (
          <button
            key={name}
            onClick={() => toggleFilter(name)}
            className={`px-4 py-2 border rounded ${
              selected.includes(name) ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500">Select unit types above to view gear.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((type) => (
          <div key={type._id} className="border p-4 rounded shadow">
            {type.defaultImage ? (
              <img
                src={urlFor(type.defaultImage).width(400).url()}
                alt={type.name}
                className="w-full h-48 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500 rounded mb-2">
                No Image
              </div>
            )}
            <h2 className="text-xl font-semibold">{type.name}</h2>
            <p><strong>Total Units:</strong> {type.count}</p>
            <p className={
              type.status === 'Available' ? 'text-green-600' :
              type.status === 'In-Use' ? 'text-red-600' :
              'text-yellow-600'
            }>
              <strong>Status:</strong> {type.status}
            </p>
            {type.description && <p className="text-sm mt-2">{type.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}