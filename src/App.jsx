import { Routes, Route } from 'react-router-dom';
import GearList from './GearList';
import InventoryDashboard from './InventoryDashboard';
import Header from './Header';
import React from 'react';
import GearCalendar from './GearCalendar';
import BookingForm from './Booking';
import GearDetail from './GearDetail';
import UpcomingEventsList from './UpcomingEventList';
function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<GearList />} />
        <Route path='/roadgear' element={<GearList/>}/>
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/gearcalendar" element={<GearCalendar />} />
        <Route path="/bookingform" element={<BookingForm />} />
        <Route path="/gear/:gearId" element={<GearDetail />} />
        <Route path="/eventslist" element={<UpcomingEventsList />} />
      </Routes>
    </>
  );
}

export default App;