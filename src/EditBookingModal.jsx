import { useEffect, useState } from 'react';
import { client } from '../sanityClient';
import LocationPicker from './LocationPicker';
import { formatISO } from 'date-fns';
import { toast } from 'react-toastify';

export default function EditBookingModal({ bookingIds, onClose }) {
  const [loading, setLoading] = useState(true);
  const [gearMap, setGearMap] = useState({});
  const [locationName, setLocationName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const data = await client.fetch(`*[_type == "booking" && _id in $ids]{
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

      const grouped = {};
      data.forEach((b) => {
        grouped[b.gearType._id] = {
          _id: b.gearType._id,
          name: b.gearType.name,
          count: (grouped[b.gearType._id]?.count || 0) + b.quantity,
        };
      });

      const first = data[0];
      setGearMap(grouped);
      setLocationName(first.locationName);
      setFullAddress(first.fullAddress);
      setLatLng({ lat: first.latitude, lng: first.longitude });
      setNotes(first.notes);
      setStartDate(first.startDate);
      setEndDate(first.endDate);
      setLoading(false);
    };

    loadData();
  }, [bookingIds]);

  const handleUpdate = async () => {
    try {
      // Delete old bookings
      for (let id of bookingIds) {
        await client.delete(id);
      }

      // Re-create
      for (const gear of Object.values(gearMap)) {
        if (gear.count > 0) {
          await client.create({
            _type: 'booking',
            gearType: { _type: 'reference', _ref: gear._id },
            quantity: gear.count,
            locationName,
            fullAddress,
            latitude: latLng.lat,
            longitude: latLng.lng,
            startDate,
            endDate,
            status: 'confirmed',
            notes,
          });
        }
      }

      toast.success('✅ Booking updated');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('❌ Update failed');
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

      {Object.entries(gearMap).map(([id, gear]) => (
        <div key={id} className="flex justify-between mt-2">
          <span>{gear.name}</span>
          <input
            type="number"
            value={gear.count}
            min={0}
            onChange={(e) => setGearMap((prev) => ({
              ...prev,
              [id]: { ...gear, count: +e.target.value },
            }))}
            className="border px-2 w-20"
          />
        </div>
      ))}

      <button onClick={handleUpdate} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </div>
  );
}