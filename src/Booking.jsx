import { useState } from 'react';
import { client } from '../sanityClient';
import { eachDayOfInterval, formatISO } from 'date-fns';
import LocationPicker from './LocationPicker';
import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ selectedGearTypes, onClose }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [locationName, setLocationName] = useState('');
const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      for (const gear of selectedGearTypes) {
        const quantity = gear.count;

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

        for (let day of requestedDays) {
          const key = day.toISOString().split('T')[0];
          const alreadyBooked = dailyBookedMap[key] || 0;
          if (alreadyBooked + quantity > gear.count) {
            setMessage(`❌ Not enough ${gear.name} units on ${key}.`);
            setSubmitting(false);
            return;
          }
        }

        await client.create({
          _type: 'booking',
          gearType: { _type: 'reference', _ref: gear._id },
          quantity,
          locationName,
          startDate,
          endDate,
          status: 'confirmed',
          notes,
          
        });
        toast.success(`✅ Booked ${gear.name} for ${locationName}`, {
            position: 'bottom-right',
            autoClose: 3000,
            hideProgressBar: false,
            pauseOnHover: true,
          });
          navigate('/events'); 
 
      }

     
      
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
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

      <LocationPicker
        onLocationSelect={({ lat, lng, locationName }) => setLocationName(locationName)}
      />

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
