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
    client
  .fetch(`*[_type == "gearType" && _id == $id][0]{
    _id,
    name,
    count,
    status,
    defaultImage
  }`, { id: gearId })
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
      {gear.defaultImage && (
  <img
    src={client
      .config()
      .projectId &&
      `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${gear.defaultImage.asset._ref.replace('image-', '').replace('-webp', '.webp').replace('-jpg', '.jpg').replace('-png', '.png')}`}
    alt={gear.name}
    className="w-full max-w-md rounded shadow"
  />
)}
    
      <p>Total Units: {gear.count}</p>
      <p>Status: {gear.status}</p>

   
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