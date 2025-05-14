import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';
import BookingForm from './Booking';
import { Link } from 'react-router-dom';
import React from 'react';

const builder = imageUrlBuilder(client);
const urlFor = (source) => builder.image(source);

export default function GearList() {
  const [types, setTypes] = useState([]);
  const [bookingGear, setBookingGear] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchAvailableGear = async () => {
      const available = await client.fetch(`*[_type == "gearType"] {
        _id,
        name,
        count,
        status,
        defaultImage,
        description,
        "booked": *[_type == "booking" && gearType._ref == ^._id && !((endDate <= $start) || (startDate >= $end))] {
          quantity
        }
      }`, { start: startDate, end: endDate });

      const filtered = available.map((gear) => {
        const totalBooked = gear.booked.reduce((sum, b) => sum + b.quantity, 0);
        return {
          ...gear,
          availableCount: gear.count - totalBooked, // for UI display
          originalCount: gear.count                // for internal logic
        };
      }).filter(g => g.availableCount > 0);

      setTypes(filtered);
    };

    fetchAvailableGear();
  }, [startDate, endDate]);

  const handleCountChange = (id, value) => {
    setBookingGear((prev) => {
      const existing = prev.find((g) => g._id === id);
      const gear = types.find((t) => t._id === id); // make sure we have access to `gear`
  
      if (!gear) return prev;
  
      if (existing) {
        return prev.map((g) =>
          g._id === id ? { ...g, count: +value } : g
        );
      } else {
        return [
          ...prev,
          {
            ...gear,
            count: +value,
            countOriginal: gear.count, // assuming you updated your `types` to keep both
          },
        ];
      }
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Select Date Range to View Available Gear</h1>

      <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
        <div>
          <label>Start Date:</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-1 ml-2"
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-1 ml-2"
          />
        </div>
      </div>

      {types.length === 0 && (
        <p className="text-center text-gray-500">Select a valid date range to load available gear.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {types.map((type) => (
          <div key={type._id} className="border p-4 rounded shadow relative bg-white">
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

            <h2 className="text-xl font-semibold">
              <Link to={`/gear/${type._id}`} className="text-blue-600 hover:underline">
                {type.name}
              </Link>
            </h2>
            <p><strong>Available:</strong> {type.availableCount} / {type.count}</p>
            <p className={
              type.status === 'Available' ? 'text-green-600' :
              type.status === 'In-Use' ? 'text-red-600' :
              'text-yellow-600'
            }>
              <strong>Status:</strong> {type.status}
            </p>
            {type.description && <p className="text-sm mt-2">{type.description}</p>}

            <div className="mt-2">
              <label className="block text-sm">Book Quantity:</label>
              <input
                type="number"
                min={0}
                max={type.availableCount}
                onChange={(e) => handleCountChange(type._id, e.target.value)}
                className="border px-2 py-1 mt-1 w-full"
              />
            </div>
          </div>
        ))}
      </div>

      {bookingGear.length > 0 && (
        <div className="mt-10 border-t pt-6">
          <BookingForm
            selectedGearTypes={bookingGear.filter((g) => g.count > 0)}
            onClose={() => setBookingGear([])}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      )}
    </div>
  );
}
