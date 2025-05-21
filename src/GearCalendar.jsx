import { useEffect, useState } from 'react';
import { format, isWithinInterval } from 'date-fns';
import BookingForm from './Booking';
import { client } from '../sanityClient';

export default function GearCalendar({ gearType }) {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "booking" && gearType._ref == $gearId] {
          startDate,
          endDate,
          quantity,
          location
        }`,
        { gearId: gearType._id }
      )
      .then(setBookings)
      .catch(console.error);
  }, [gearType]);

  const today = new Date();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const getBookedQty = (day) => {
    return bookings
      .filter((b) => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return isWithinInterval(day, { start, end });
      })
      .reduce((sum, b) => sum + b.quantity, 0);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Availability: {gearType.name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {days.map((day) => {
          const booked = getBookedQty(day);
          const available = gearType.count - booked;

          return (
            <button
              key={day.toISOString()}
              className="border p-4 rounded text-left hover:bg-blue-100"
              onClick={() => {
                setSelectedDate(day);
                setShowForm(true);
              }}
            >
              <div className="font-semibold">{format(day, 'EEE MMM d')}</div>
              <div className="text-sm">
                Booked: {booked} / {gearType.totalUnits}
              </div>
              <div className={available <= 0 ? 'text-red-600' : 'text-green-600'}>
                {available <= 0 ? 'Unavailable' : `${available} available`}
              </div>
            </button>
          );
        })}
      </div>

      {showForm && selectedDate && (
        <BookingForm
          preType={gearType}
          preselectedDate={selectedDate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}