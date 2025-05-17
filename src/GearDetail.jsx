import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../sanityClient';
import React from 'react';
import { format, parseISO, min, max } from 'date-fns';

export default function GearDetail() {
  const { gearId } = useParams();
  const [gear, setGear] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gearId) return;
    setLoading(true);

    Promise.all([
      client.fetch(
        `*[_type=="gearType" && _id==$id][0]{
          _id,name,count,status,defaultImage,description
        }`,
        { id: gearId }
      ),
      client.fetch(
        `*[_type=="inventory" && gearProfile._ref==$id]{_id,location,count}`,
        { id: gearId }
      ),
      client.fetch(
        `*[_type=="booking" && gearType._ref==$id && endDate>=now()]|order(startDate asc)`,
        { id: gearId }
      ),
      client.fetch(
        `*[_type=="booking" && gearType._ref==$id && endDate<now()]|order(endDate desc)`,
        { id: gearId }
      ),
    ])
      .then(([g, inv, up, hist]) => {
        setGear(g);
        setInventory(inv);
        setUpcoming(up);
        setHistory(hist);
      })
      .catch((err) => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, [gearId]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (!gear) return <div className="p-6 text-red-500">Gear not found.</div>;

  const totalUnits = gear.count;
  const bookedUnits = upcoming.reduce((sum, b) => sum + b.quantity, 0);
  const inStudio = totalUnits - bookedUnits;

  let upcomingSpan = null;
  if (upcoming.length > 0) {
    const starts = upcoming.map(b => parseISO(b.startDate));
    const ends = upcoming.map(b => parseISO(b.endDate));
    upcomingSpan = { start: min(starts), end: max(ends) };
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{gear.name}</h1>

      {gear.defaultImage ? (
        <img
          src={`https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${gear.defaultImage.asset._ref.replace('image-', '').replace(/-(webp|jpg|png)/, '.$1')}`}
          alt={gear.name}
          className="w-full max-w-md rounded shadow"
        />
      ) : (
        <div className="w-full max-w-md h-48 bg-gray-200 flex items-center justify-center rounded">No Image</div>
      )}

      {gear.description && <p className="text-sm text-gray-600">{gear.description}</p>}

      <div className="space-y-1">
        <p><strong>Total Road Units:</strong> {totalUnits}</p>
        <p><strong>Road Gear Booked/Transit:</strong> {bookedUnits}</p>
        <p><strong>Road Units Remaining:</strong> {inStudio}</p>
        <p><strong>Status:</strong> {gear.status}</p>
      </div>

      <h2 className="text-xl font-semibold mt-6">Studio Inventory</h2>
      {inventory.length === 0 ? (
        <p className="text-gray-500">No studio inventory records.</p>
      ) : (
        <ul className="list-disc pl-6">
          {inventory.map(inv => (
            <li key={inv._id}>
              {inv.location}: <span className='font-bold'>{inv.count}</span> unit{inv.count !== 1 ? 's' : ''}
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-semibold mt-6">Upcoming / Active Bookings</h2>
      {upcoming.length === 0 ? (
        <p className="text-gray-500">No active or upcoming bookings.</p>
      ) : (
        <>
          {upcomingSpan && (
            <p className="text-sm text-gray-600 mb-2">
              📅 {format(upcomingSpan.start, 'MMM d')} – {format(upcomingSpan.end, 'MMM d')}
            </p>
          )}
          <ul className="list-disc pl-6">
            {upcoming.map(b => (
              <li key={b._id} className="mb-2">
                <strong>{b.locationName}</strong> — {b.quantity} unit{b.quantity > 1 ? 's' : ''}
                <br />
                <span className="text-sm text-gray-600">
                  {format(parseISO(b.startDate), 'MMM d')} – {format(parseISO(b.endDate), 'MMM d')}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="text-xl font-semibold mt-6">Booking History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No past bookings.</p>
      ) : (
        <ul className="list-disc pl-6">
          {history.map(b => (
            <li key={b._id} className="mb-2">
              <strong>{b.locationName}</strong> — {b.quantity} unit{b.quantity > 1 ? 's' : ''}
              <br />
              <span className="text-sm text-gray-600">
                {format(parseISO(b.startDate), 'MMM d')} – {format(parseISO(b.endDate), 'MMM d')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}