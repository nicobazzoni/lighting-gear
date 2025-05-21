import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import LocationPicker from './LocationPicker';
import { toast } from 'react-toastify';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EditBookingModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [gearMap, setGearMap] = useState({});
  const [allGearTypes, setAllGearTypes] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const location = useLocation();
  const bookingIds = location.state?.bookingIds || [];
  const navigate = useNavigate()
  const [updating, setUpdating] = useState(false);
const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookings = await client.fetch(`*[_type == "booking" && _id in $ids]{
          _id,
          gearType->{ _id, name },
          quantity,
          locationName,
          fullAddress,
          latitude,
          longitude,
          notes,
          startDate,
          endDate
        }`, { ids: bookingIds });

        if (!bookings.length) {
          toast.error('No matching bookings found.');
          setLoading(false);
          return;
        }

        const grouped = {};
        bookings.forEach((b) => {
          grouped[b.gearType._id] = {
            _id: b.gearType._id,
            name: b.gearType.name,
            count: (grouped[b.gearType._id]?.count || 0) + b.quantity,
          };
        });

        const first = bookings[0];
        setGearMap(grouped);
        setLocationName(first.locationName);
        setFullAddress(first.fullAddress);
        setLatLng({ lat: first.latitude, lng: first.longitude });
        setNotes(first.notes);
        setStartDate(first.startDate);
        setEndDate(first.endDate);

        const allGear = await client.fetch(`*[_type == "gearType"]{_id, name}`);
        setAllGearTypes(allGear);
        setLoading(false);
      } catch (err) {
        console.error('Error loading bookings:', err);
        toast.error('Failed to load bookings');
        setLoading(false);
      }
    };

    if (bookingIds.length > 0) loadData();
    else {
      toast.error('No booking IDs passed');
      setLoading(false);
    }
  }, [bookingIds]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      for (let id of bookingIds) await client.delete(id);
      for (const gear of Object.values(gearMap)) {
        if (gear.count > 0) {
          await client.create({ /* ... */ });
        }
      }
      toast.success('✅ Booking updated');
      navigate('/events');
    } catch (err) {
      console.error(err);
      toast.error('❌ Update failed');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    setDeleting(true);
    try {
      for (let id of bookingIds) await client.delete(id);
      toast.success('🗑️ Booking deleted');
      navigate('/events');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to delete booking');
    } finally {
      setDeleting(false);
    }
  };


  
  if (loading) return <div className="p-6">Loading booking...</div>;

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-xl mx-auto relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">✖</button>
      <h2 className="text-xl font-bold mb-4">Edit Booking</h2>

      <LocationPicker
        onLocationSelect={({ lat, lng, locationName, fullAddress }) => {
          setLatLng({ lat, lng });
          setLocationName(locationName);
          setFullAddress(fullAddress);
        }}
      />
      <p className="text-sm text-gray-500 mt-1">{fullAddress}</p>

      <input
        type="datetime-local"
        value={startDate ? new Date(startDate).toISOString().slice(0, 16) : ''}
        onChange={(e) => setStartDate(e.target.value)}
        className="border p-2 mt-2 w-full"
      />
      <input
        type="datetime-local"
        value={endDate ? new Date(endDate).toISOString().slice(0, 16) : ''}
        onChange={(e) => setEndDate(e.target.value)}
        className="border p-2 mt-2 w-full"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="border p-2 mt-2 w-full"
        placeholder="Notes"
      />

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Gear Selection</h3>
        {allGearTypes.map((gear) => {
          const existing = gearMap[gear._id] || { _id: gear._id, name: gear.name, count: 0 };
          return (
            <div key={gear._id} className="flex justify-between items-center mb-2">
              <span>{gear.name}</span>
              <input
                type="number"
                value={existing.count}
                min={0}
                onChange={(e) =>
                  setGearMap((prev) => ({
                    ...prev,
                    [gear._id]: { ...existing, count: +e.target.value },
                  }))
                }
                className="border px-2 py-1 w-20"
              />
            </div>
          );
        })}
      </div>

      <button onClick={handleUpdate} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>

      <button
    onClick={handleDelete}
    className="bg-red-600 text-white px-4 py-2 rounded"
  >
    Delete Booking
  </button>
    </div>
  );
}