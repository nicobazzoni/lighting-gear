import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lighting Tracker</h1>
        <nav className="space-x-4">
          <Link to="/roadgear" className="hover:underline">Road Gear</Link>
          <Link to="/inventory" className="hover:underline">Inventory</Link>
          <Link to="/eventslist" className="hover:underline">Booked Events</Link>
        </nav>
      </div>
    </header>
  );
}