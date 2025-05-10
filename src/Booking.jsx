import { useState } from 'react';
import { client } from '../sanityClient';
import { eachDayOfInterval, formatISO } from 'date-fns';
import LocationPicker from './LocationPicker';
import React from 'react';

export default function BookingForm({ preselectedGearType, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [status] = useState('confirmed');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [locationCoords, setLocationCoords] = useState(null); // lat/lng
  const [locationName, setLocationName] = useState(''); // city, state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const overlappingBookings = await client.fetch(
        `*[_type == "booking" && gearType._ref == $gearId &&
           !((endDate <= $start) || (startDate >= $end))]`,
        {
          gearId: preselectedGearType._id,
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

      let conflictDay = null;
      for (let day of requestedDays) {
        const key = day.toISOString().split('T')[0];
        const alreadyBooked = dailyBookedMap[key] || 0;
        const totalAvailable = preselectedGearType.count || 0;

        if (alreadyBooked + quantity > totalAvailable) {
          conflictDay = key;
          break;
        }
      }

      if (conflictDay) {
        setMessage(`❌ Not enough units on ${conflictDay}.`);
        setSubmitting(false);
        return;
      }

      await client.create({
        _type: 'booking',
        gearType: { _type: 'reference', _ref: preselectedGearType._id },
        quantity,
        locationName, // ✅ THIS is what gets saved
        startDate,
        endDate,
        status,
        notes,
      });

      setMessage('✅ Booking submitted!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setMessage('❌ Error creating booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white mt-4 space-y-3">
      <h3 className="font-bold text-lg">Book: {preselectedGearType.name}</h3>

      <div>
        <label>Start Date:</label>
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="border p-1 ml-2"
        />
      </div>

      <div>
        <label>End Date:</label>
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
          className="border p-1 ml-2"
        />
      </div>

      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(+e.target.value)}
          min={1}
          max={preselectedGearType.count}
          className="border p-1 ml-2"
        />
      </div>

      <LocationPicker
  onLocationSelect={({ lat, lng, locationName }) => {
    setLocationCoords({ lat, lng });
    setLocationName(locationName);
  }}
/>

      <div>
        <label>Notes (optional):</label>
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