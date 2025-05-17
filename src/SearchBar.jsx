import React, { useState, useEffect, useRef } from 'react';
import { client } from '../sanityClient';
import { Link } from 'react-router-dom';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length < 2) return;
  
      client.fetch(
        `*[
          _type in ["gearType", "booking"] &&
          (
            name match $q || 
            locationName match $q || 
            gearType->name match $q
          )
        ]{
          _id,
          _type,
          name,
          locationName,
          startDate,
          gearType->{ name }
        }`,
        { q: "*" + query.toLowerCase() + "*" }
      ).then((data) => {
        setResults(data.slice(0, 3)); // limit to 3 results
        setVisible(true); 

      });
    }, 300);
  
    return () => clearTimeout(delayDebounce);
  }, [query]);

  // 👀 Detect click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="mb-6 px-4 relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search gear, bookings, locations..."
        className="w-full border p-2 rounded"
      />

      {visible && results.length > 0 && (
        <div className="absolute mt-2 bg-white border rounded shadow p-4 z-50 w-full">
          <h4 className="font-bold mb-2">Search Results:</h4>
          <ul className="list-disc ml-5 space-y-2">
            {results.map((r) => (
              <li key={r._id}>
                {r._type === 'gearType' && (
                  <Link to={`/gear/${r._id}`} className="text-blue-600 hover:underline">
                    🔧 {r.name}
                  </Link>
                )}
                {r._type === 'booking' && (
                  <Link to={`/events#${r._id}`} className="text-green-700 hover:underline">
                    📅 {r.gearType?.name} at {r.locationName}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}