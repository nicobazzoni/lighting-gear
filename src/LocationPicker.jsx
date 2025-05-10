import React, { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  useLoadScript,
  Autocomplete
} from '@react-google-maps/api';

const libraries = ['places'];
const mapContainerStyle = { width: '100%', height: '300px' };
const defaultCenter = { lat: 40.7128, lng: -74.006 };

export default function LocationPicker({ onLocationSelect }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [marker, setMarker] = useState(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const address = place.address_components || [];
    const city = address.find(c => c.types.includes('locality'))?.long_name;
    const state = address.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
    const country = address.find(c => c.types.includes('country'))?.short_name;
    const locationName = [city, state || country].filter(Boolean).join(', ');

    setMarker({ lat, lng });
    if (inputRef.current) inputRef.current.value = locationName;

    onLocationSelect({ lat, lng, locationName });
  };

  const handleMapClick = useCallback(async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    const place = data.results?.[0];
    const address = place?.address_components || [];

    const city = address.find(c => c.types.includes('locality'))?.long_name;
    const state = address.find(c => c.types.includes('administrative_area_level_1'))?.short_name;
    const country = address.find(c => c.types.includes('country'))?.short_name;
    const locationName = [city, state || country].filter(Boolean).join(', ');

    if (inputRef.current) inputRef.current.value = locationName;

    onLocationSelect({ lat, lng, locationName });
  }, [onLocationSelect]);

  if (loadError) return <p className="text-red-600">Error loading map</p>;
  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <>
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a place"
          className="border px-2 py-1 mb-2 w-full"
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={8}
        center={marker || defaultCenter}
        onClick={handleMapClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </>
  );
}