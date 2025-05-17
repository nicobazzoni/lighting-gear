import React from 'react';
import SearchBar from './SearchBar';

import { Link } from 'react-router-dom';

export default function Header() {

  return (
    <header className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
      <Link to= '/' className="text-2xl font-bold">Lighting Tracker</Link>
        <nav className="space-x-4">
          <Link to="/roadgear" className="hover:underline">Road Gear</Link>
          <Link to="/inventory" className="hover:underline">Inventory</Link>
          <Link to="/events" className="hover:underline">Events</Link>
        </nav>
        <SearchBar/>
      </div>
    </header>
  );
}