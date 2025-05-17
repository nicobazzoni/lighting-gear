import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { format, startOfToday } from 'date-fns';
import React from 'react';

export default function UpcomingEventsList() {
  const [groupedEvents, setGroupedEvents] = useState({ upcoming: {}, past: {} });
  const [editing, setEditing] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    client
      .fetch(`*[_type == "booking"] | order(startDate asc) {
        _id,
        locationName,
        startDate,
        endDate,
        quantity,
        gearType->{ name }
      }`)
      .then((data) => {
        const upcoming = {};
        const past = {};
        const today = startOfToday();

        data.forEach((item) => {
          const location = item.locationName || 'Unknown Location';
          const gearName = item.gearType?.name || 'Unknown Gear';

          const start = new Date(item.startDate);
          const end = new Date(item.endDate);

          // Determine whether the booking is past or upcoming
          const isPast = end < today;
          const target = isPast ? past : upcoming;

          if (!target[location]) {
            target[location] = {
              startDate: start,
              endDate: end,
              gearMap: {},
            };
          }

          const group = target[location];
          if (start < group.startDate) group.startDate = start;
          if (end > group.endDate) group.endDate = end;

          if (!group.gearMap[gearName]) group.gearMap[gearName] = [];
          group.gearMap[gearName].push(item);
        });

        setGroupedEvents({ upcoming, past });
      });
  }, [refresh]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upcoming Events by Location</h2>
      {Object.keys(groupedEvents.upcoming).length === 0 && (
        <p className="text-gray-500">No upcoming bookings found.</p>
      )}

      {Object.entries(groupedEvents.upcoming).map(([location, info]) => (
        <div key={location} className="mb-8 border-b pb-4">
          <h3 className="text-xl font-semibold mb-1">📍 {location}</h3>
          <p className="text-sm text-gray-600 mb-2">
            📅 {format(info.startDate, 'MMM d')} – {format(info.endDate, 'MMM d')}
          </p>
          {Object.entries(info.gearMap || {}).map(([gearName, bookings]) => (
            <div key={gearName} className="mb-2 ml-4">
              <strong>{gearName}</strong>
              <ul className="list-disc ml-5">
                {bookings.map((b) => (
                  <li key={b._id}id={b._id}>
                    {b.quantity} unit{b.quantity > 1 ? 's' : ''} (
                    {format(new Date(b.startDate), 'MMM d')} - {format(new Date(b.endDate), 'MMM d')})
                    <button
                      onClick={() => setEditing(b)}
                      className="ml-2 text-blue-600 text-sm underline"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      <hr className="my-8" />

      <h2 className="text-2xl font-bold mb-6">Past Events by Location</h2>
      {Object.keys(groupedEvents.past).length === 0 && (
        <p className="text-gray-500">No past bookings found.</p>
      )}

      {Object.entries(groupedEvents.past).map(([location, info]) => (
        <div key={location} className="mb-8 border-b pb-4">
          <h3 className="text-xl font-semibold mb-1">📍 {location}</h3>
          <p className="text-sm text-gray-600 mb-2">
            📅 {format(info.startDate, 'MMM d')} – {format(info.endDate, 'MMM d')}
          </p>
          {Object.entries(info.gearMap || {}).map(([gearName, bookings]) => (
            <div key={gearName} className="mb-2 ml-4">
              <strong>{gearName}</strong>
              <ul className="list-disc ml-5">
                {bookings.map((b) => (
                  <li key={b._id}>
                    {b.quantity} unit{b.quantity > 1 ? 's' : ''} (
                    {format(new Date(b.startDate), 'MMM d')} - {format(new Date(b.endDate), 'MMM d')})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}

      {editing && <EditEventModal booking={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditEventModal({ booking, onClose }) {
  const [quantity, setQuantity] = useState(booking.quantity);
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);

  const handleSave = async () => {
    try {
      await client
        .patch(booking._id)
        .set({
          quantity,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        })
        .commit();
      console.log("✅ Booking updated");
      onClose();
    } catch (err) {
      console.error("❌ Patch failed:", err);
    }
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
