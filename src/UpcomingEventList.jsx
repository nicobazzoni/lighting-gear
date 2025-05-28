import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { format, startOfToday } from 'date-fns';
import React from 'react';
import { useNavigate } from 'react-router';
import EditBookingModal from './EditBookingModal';

export default function UpcomingEventsList() {
  const [groupedEvents, setGroupedEvents] = useState({ upcoming: {}, past: {} });
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  
  useEffect(() => {
    client.fetch(`*[_type == "booking"] | order(startDate asc) {
      _id,
      locationName,
      fullAddress,
      latitude,
      longitude,
      startDate,
      endDate,
      quantity,
      notes,
      gearType->{ name }
    }`).then((data) => {
      const upcoming = {};
      const past = {};
      const today = startOfToday();
      const locationKeyMap = {};

      data.forEach((item) => {
        const location = item.locationName || 'Unknown Location';
        const gearName = item.gearType?.name || 'Unknown Gear';
        const start = new Date(item.startDate);
        const end = new Date(item.endDate);
        const isPast = end < today;
        const locationKey = `${location}_${item.startDate}_${item.endDate}`;

        if (!locationKeyMap[locationKey]) {
          locationKeyMap[locationKey] = {
            location,
            startDate: start,
            endDate: end,
            gearMap: {},
            fullAddress: item.fullAddress,
            latitude: item.latitude,
            longitude: item.longitude,
            allBookings: []
          };
        }

        const group = locationKeyMap[locationKey];
        group.allBookings.push(item);

        if (!group.gearMap[gearName]) {
          group.gearMap[gearName] = { total: 0, bookingIds: new Set() };
        }

        if (!group.gearMap[gearName].bookingIds.has(item._id)) {
          group.gearMap[gearName].total += item.quantity;
          group.gearMap[gearName].bookingIds.add(item._id);
        }
      });

      const groupedByLocation = { upcoming: {}, past: {} };

      Object.entries(locationKeyMap).forEach(([groupKey, entry]) => {
        const isPast = entry.endDate < today;
        const target = isPast ? groupedByLocation.past : groupedByLocation.upcoming;

        target[groupKey] = {
          ...entry,
        };
      });

      setGroupedEvents(groupedByLocation);
    });
  }, [refresh]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upcoming Events by Location</h2>
      {Object.keys(groupedEvents.upcoming).length === 0 && (
        <p className="text-gray-500">No upcoming bookings found.</p>
      )}

      {Object.entries(groupedEvents.upcoming).map(([groupKey, info]) => (
        <div key={groupKey} className="mb-8 border-b pb-4">
          <h3 className="text-xl font-semibold mb-1">📍 {info.location}</h3>
          
          <button
  onClick={() => {
    const ids = info.allBookings?.map((b) => b._id) || [];
    if (ids.length === 0) return;

    navigate('/edit-booking', {
      state: { bookingIds: ids },
    });
  }}
  className="text-yellow-600 text-sm underline"
>
  Edit Event
</button>

          <p className="text-sm italic text-gray-500">{info.fullAddress || 'No address'}</p>

          {info.latitude && info.longitude && (
            <a
              className="text-blue-500 text-sm underline"
              href={`https://www.google.com/maps/search/?api=1&query=${info.latitude},${info.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Google Maps
            </a>
          )}
          {info.allBookings[0]?.notes && (
  <p className="text-sm text-gray-700 mt-2">
    📝 <strong>Notes:</strong> {info.allBookings[0].notes}
  </p>
)}

          <p className="text-sm text-gray-600 mb-2">
            📅 {format(info.startDate, 'MMM d')} – {format(info.endDate, 'MMM d')}
          </p>

          {Object.entries(info.gearMap).map(([gearName, data]) => (
            <div key={gearName} className="mb-2 ml-4">
              <strong>{gearName}</strong>
              <ul className="list-disc ml-5">
                <li>
                  {data.total} unit{data.total > 1 ? 's' : ''} ({format(info.startDate, 'MMM d')} - {format(info.endDate, 'MMM d')})
                </li>
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}