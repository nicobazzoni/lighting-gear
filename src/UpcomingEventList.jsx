import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { format } from 'date-fns';
import React from 'react';

export default function UpcomingEventsList() {
  const [events, setEvents] = useState({});
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    client
      .fetch(`*[_type == "booking" && startDate >= now()] | order(startDate asc) {
        _id,
        locationName,
        startDate,
        endDate,
        quantity,
        gearType->{ name }
      }`)
      .then((data) => {
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.locationName]) acc[item.locationName] = [];
          acc[item.locationName].push(item);
          return acc;
        }, {});
        setEvents(grouped);
      });
  }, [refresh]);

  const handleUpdate = async () => {
    setEditing(null);
    setRefresh(!refresh);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events by Location</h2>
      {Object.entries(events).map(([location, bookings]) => (
        <div key={location} className="mb-6">
          <h3 className="text-xl font-semibold">{location}</h3>
          <ul className="ml-4 list-disc">
            {bookings.map((b, i) => (
              <li key={i} className="mb-2">
                {b.gearType?.name || 'Unknown Gear'} — {b.quantity} units <br />
                <span className="text-sm text-gray-600">
                  {format(new Date(b.startDate), 'MMM d')} to {format(new Date(b.endDate), 'MMM d')}
                </span>
                <br />
                <button
                  onClick={() => setEditing(b)}
                  className="text-blue-600 hover:underline text-sm mt-1"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {editing && <EditEventModal booking={editing} onClose={handleUpdate} />}
    </div>
  );
}

function EditEventModal({ booking, onClose }) {
  const [quantity, setQuantity] = useState(booking.quantity);
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);

  const handleSave = async () => {
    await client.patch(booking._id)
      .set({ quantity, startDate, endDate })
      .commit();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-xl w-96">
        <h3 className="text-lg font-bold mb-2">Edit Booking</h3>

        <label className="block text-sm">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          className="border w-full p-1 mb-3"
        />

        <label className="block text-sm">Start Date</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border w-full p-1 mb-3"
        />

        <label className="block text-sm">End Date</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border w-full p-1 mb-3"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
