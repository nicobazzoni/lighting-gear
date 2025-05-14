import { useState } from 'react';
import { client } from '../sanityClient';
import { eachDayOfInterval, formatISO } from 'date-fns';
import LocationPicker from './LocationPicker';
import React from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function BookingForm({ selectedGearTypes = [], onClose, startDate, endDate }) {

  
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [locationName, setLocationName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log('🚀 Submit triggered');
  
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
  
      console.log('📅 Start:', start.toISOString(), 'End:', end.toISOString());
      console.log('📦 Selected gear:', selectedGearTypes);
  
      for (const gear of selectedGearTypes) {
        const quantity = gear.count || 0;
        console.log(`🔎 Checking gear: ${gear.name}, Qty: ${quantity}`);
  
        const overlappingBookings = await client.fetch(
          `*[_type == "booking" && gearType._ref == $gearId && !((endDate <= $start) || (startDate >= $end))]`,
          {
            gearId: gear._id,
            start: formatISO(start),
            end: formatISO(end),
          }
        );
  
        console.log(`📊 Overlapping bookings for ${gear.name}:`, overlappingBookings);
  
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
          dailyBookedMap[key] = 0;
        
          for (let booking of overlappingBookings) {
            const bStart = new Date(booking.startDate);
            const bEnd = new Date(booking.endDate);
            if (day >= bStart && day <= bEnd) {
              dailyBookedMap[key] += booking.quantity;
            }
          }
        }
  
        const newBooking = {
          _type: 'booking',
          gearType: { _type: 'reference', _ref: gear._id },
          quantity,
          locationName,
          startDate,
          endDate,
          status: 'confirmed',
          notes,
        };
  
        console.log('📤 Creating booking:', newBooking);
        await client.create(newBooking);
  
        toast.success(`✅ Booked ${gear.name} for ${locationName}`, {
          position: 'bottom-right',
          autoClose: 3000,
          hideProgressBar: false,
          pauseOnHover: true,
        });
      }
  
      console.log('✅ All bookings created, navigating to /events');
      navigate('/events');
  
      setTimeout(() => {
        setMessage('');
        console.log('🔙 Closing booking form');
        onClose();
      }, 1200);
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