import { useState } from 'react';
import { client } from '../sanityClient';
import { eachDayOfInterval, formatISO } from 'date-fns';
import LocationPicker from './LocationPicker';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function BookingForm({ selectedGearTypes = [], onClose, startDate, endDate }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [locationName, setLocationName] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [latLng, setLatLng] = useState({ lat: null, lng: null });

  const navigate = useNavigate();

  const formIsValid =
    startDate &&
    endDate &&
    locationName &&
    fullAddress &&
    latLng.lat &&
    latLng.lng &&
    selectedGearTypes.some((gear) => gear.count > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formIsValid) {
      toast.error('Please fill out all fields and select at least one gear item.');
      return;
    }

    setSubmitting(true);

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const gearToBook = selectedGearTypes.filter((g) => g.count > 0);

    try {
      await toast.promise(
        Promise.all(
          gearToBook.map((gear) =>
            client.create({
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
            })
          )
        ),
        {
          pending: 'Saving booking...',
          success: '✅ Booking saved!',
          error: '❌ Failed to save booking.',
        }
      );

      navigate('/events');
      onClose?.();
    } catch (err) {
      console.error('❌ Booking error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold">Booking Details</h3>

      <LocationPicker
        onLocationSelect={({ lat, lng, locationName, fullAddress }) => {
          setLatLng({ lat, lng });
          setLocationName(locationName);
          setFullAddress(fullAddress);
        }}
      />

      {fullAddress && (
        <p className="text-sm italic text-gray-600">📍 {fullAddress}</p>
      )}

      {selectedGearTypes.map((gear) => (
        <div key={gear._id}>
          <strong>{gear.name}:</strong> {gear.count} units
        </div>
      ))}

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
        disabled={!formIsValid || submitting}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded text-white transition ${
          formIsValid && !submitting
            ? 'bg-blue-600 hover:bg-blue-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Booking'
        )}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}