// BookingForm.jsx (Final Fixed Version)
import { useState } from 'react';
import { client } from '../sanityClient';
import { eachDayOfInterval, formatISO } from 'date-fns';
import LocationPicker from './LocationPicker';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import React from 'react'
export default function BookingForm({ selectedGearTypes = [], onClose, startDate, endDate }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [locationName, setLocationName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      for (const gear of selectedGearTypes) {
        const quantity = gear.count || 0;

        const overlappingBookings = await client.fetch(
          `*[_type == "booking" && gearType._ref == $gearId && !((endDate <= $start) || (startDate >= $end))]`,
          {
            gearId: gear._id,
            start: formatISO(start),
            end: formatISO(end),
          }
        );

        const requestedDays = eachDayOfInterval({ start, end });
        const dailyBookedMap = {};

        for (let booking of overlappingBookings) {
          const bStart = new Date(booking.startDate);
          const bEnd = new Date(booking.endDate);
          const days = eachDayOfInterval({ start: bStart, end: bEnd });
          for (let d of days) {
            const key = d.toISOString().split('T')[0];
            dailyBookedMap[key] = (dailyBookedMap[key] || 0) + booking.quantity;
          }
        }

        const newBooking = {
          _type: 'booking',
          gearType: { _type: 'reference', _ref: gear._id },
          quantity,
          locationName,
          fullAddress,
          latitude: latLng.lat,
          longitude: latLng.lng,
          startDate,
          endDate,
          status: 'confirmed',
          notes,
        };

        await client.create(newBooking);
        toast.success(`Booked ${gear.name} for ${locationName}`);
      }

      navigate('/events');
      onClose?.();
    } catch (err) {
      console.error('❌ Booking error:', err);
      toast.error('❌ Failed to book. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Booking Details</h3>

      {selectedGearTypes.map((gear) => (
        <div key={gear._id}>
          <strong>{gear.name}:</strong> {gear.count} units
        </div>
      ))}

      <LocationPicker
        onLocationSelect={({ lat, lng, locationName, fullAddress }) => {
          setLatLng({ lat, lng });
          setLocationName(locationName);
          setFullAddress(fullAddress);
        }}
      />

      {fullAddress && (
        <p className="text-sm italic text-gray-600">Full Address: {fullAddress}</p>
      )}

      <div>
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {submitting ? 'Submitting...' : 'Submit Booking'}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}