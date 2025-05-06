import React, { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

export default function GearList() {
  const [types, setTypes] = useState([]);

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Road Gear by Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {types
  .filter(type => type.name && type.count !== undefined && type.status)
  .map((type) => (
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
        type.status === 'Fully Available' ? 'text-green-600' :
        type.status === 'Unavailable' ? 'text-red-600' :
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