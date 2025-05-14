import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { format } from 'date-fns';
import React from 'react';

export default function UpcomingEventsList() {
  const [groupedEvents, setGroupedEvents] = useState({});

  useEffect(() => {
    client
      .fetch(`*[_type == "booking" && startDate >= now()] | order(locationName asc, startDate asc) {
        _id,
        locationName,
        startDate,
        endDate,
        quantity,
        gearType->{ name }
      }`)
      .then((data) => {
        const grouped = {};

        data.forEach((item) => {
          const location = item.locationName || 'Unknown Location';

          if (!grouped[location]) {
            grouped[location] = {
              startDate: new Date(item.startDate),
              endDate: new Date(item.endDate),
              gearMap: {},
            };
          } else {
            const group = grouped[location];
            if (new Date(item.startDate) < group.startDate) group.startDate = new Date(item.startDate);
            if (new Date(item.endDate) > group.endDate) group.endDate = new Date(item.endDate);
          }

          const gearName = item.gearType?.name || 'Unknown Gear';
          if (!grouped[location].gearMap[gearName]) {
            grouped[location].gearMap[gearName] = 0;
          }
          grouped[location].gearMap[gearName] += item.quantity;
        });

        setGroupedEvents(grouped);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upcoming Events by Location</h2>
      {Object.entries(groupedEvents).map(([location, info]) => (
        <div key={location} className="mb-8">
          <h3 className="text-xl font-semibold mb-1">📍 {location}</h3>
          <p className="text-sm text-gray-600 mb-2">
            📅 {format(info.startDate, 'MMM d')} – {format(info.endDate, 'MMM d')}
          </p>
          <ul className="ml-4 list-disc">
            {Object.entries(info.gearMap).map(([gearName, qty]) => (
              <li key={gearName}>{gearName} — {qty} unit{qty > 1 ? 's' : ''}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
