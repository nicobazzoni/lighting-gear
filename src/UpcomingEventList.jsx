import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import { format } from 'date-fns';
import React from 'react';

export default function UpcomingEventsList() {
  const [events, setEvents] = useState({});

  useEffect(() => {
    client
      .fetch(`*[_type == "booking" && startDate >= now()] | order(startDate asc) {
        locationName,
        startDate,
        endDate,
        quantity,
        gearType->{
          name
        }
      }`)
      .then((data) => {
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.locationName]) acc[item.locationName] = [];
          acc[item.locationName].push(item);
          return acc;
        }, {});
        setEvents(grouped);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events by Location</h2>
      {Object.entries(events).map(([location, bookings]) => (
        <div key={location} className="mb-6">
          <h3 className="text-xl font-semibold">{location}</h3>
          <ul className="ml-4 list-disc">
            {bookings.map((b, i) => (
              <li key={i}>
                {b.gearType?.name || 'Unknown Gear'} — {b.quantity} units <br />
                <span className="text-sm text-gray-600">
                  {format(new Date(b.startDate), 'MMM d')} to {format(new Date(b.endDate), 'MMM d')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}