import { Routes, Route } from 'react-router-dom';
import GearList from './GearList';
import InventoryDashboard from './InventoryDashboard';
import Header from './Header';
import React from 'react';
function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GearList />} />
        <Route path='/roadgear' element={<GearList/>}/>
        <Route path="/inventory" element={<InventoryDashboard />} />
      </Routes>
    </>
  );
}

export default App;