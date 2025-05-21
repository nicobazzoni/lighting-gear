import { Routes, Route } from 'react-router-dom';
import GearList from './GearList';
import InventoryDashboard from './InventoryDashboard';
import Header from './Header';
import React from 'react';
import GearCalendar from './GearCalendar';
import BookingForm from './Booking';
import GearDetail from './GearDetail';
import UpcomingEventsList from './UpcomingEventList';
import { ToastContainer } from 'react-toastify';
import EditBookingModal from './EditBookingModal';

import 'react-toastify/dist/ReactToastify.css';
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
        <Route path="/events" element={<UpcomingEventsList />} />
        <Route path="/edit-booking" element={<EditBookingModal />} />

      </Routes>
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;