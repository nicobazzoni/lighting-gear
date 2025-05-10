import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { client } from '../sanityClient';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from './LocationPicker';
export default function GearDetail() {
  const { gearId } = useParams();
  const [gear, setGear] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gearId) return;

    client
      .fetch(`*[_type == "gearType" && _id == $id][0]`, { id: gearId })
      .then(setGear);

    client
      .fetch(
        `*[_type == "booking" && gearType._ref == $id && startDate >= now()] | order(startDate asc)`,
        { id: gearId }
      )
      .then(setUpcoming);

    client
      .fetch(
        `*[_type == "booking" && gearType._ref == $id && endDate < now()] | order(endDate desc)`,
        { id: gearId }
      )
      .then(setHistory);
  }, [gearId]);

  if (!gear) return <p className="p-4">Loading gear...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{gear.name}</h1>
      <p>Total Units: {gear.count}</p>
      <p>Status: {gear.status}</p>

      <h2 className="text-xl font-semibold mt-6">Upcoming Bookings</h2>
      <h2 className="text-xl font-semibold mt-6">Upcoming Bookings</h2>
<ul className="list-disc pl-6">
{upcoming.map((b) => (
  <li key={b._id}>
    {b.locationName} from {new Date(b.startDate).toLocaleDateString()} to{' '}
    {new Date(b.endDate).toLocaleDateString()} — Qty: {b.quantity}
  </li>
))}
</ul>

     
      <h2 className="text-xl font-semibold mt-6">Booking History</h2>
<ul className="list-disc pl-6">

</ul>
     
    </div>
  );
}