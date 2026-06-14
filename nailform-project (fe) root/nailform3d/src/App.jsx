import { Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import Custom from './pages/Custom';
import Booking from './pages/Booking';
import Gallery from './pages/Gallery';
import Social from './pages/Social';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NailDesign3D from './pages/NailDesign3D';
import SocialDetail from './pages/SocialDetail';
import SalonDetail from './pages/SalonDetail';
import BookingDesignPayment from './pages/BookingDesignPayment';
import NailBoxProducts from './pages/NailBoxProducts';
import NailBoxDetail from './pages/NailBoxDetail';
import NailBoxPayment from './pages/NailBoxPayment';
import Technicans from './pages/Technicans';
import Reviews from './pages/Reviews';
import Location from './pages/Location';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import MyOffers from './pages/MyOffers';
import ScheduleAppointment from './pages/ScheduleAppointment';
import SalonAppointments from './pages/SalonAppointments';
import UserAppointments from './pages/UserAppointments';
import SalonProfileEdit from './pages/SalonProfileEdit';
import BookAppointment from './pages/BookAppointment';
import Pricing from './pages/Pricing';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminDashboard from './pages/AdminDashboard';
import Payment from './pages/Payment';

import SalonMembers from './pages/SalonMembers';
import UserProfile from './pages/UserProfile';

import OrderDetail from './pages/OrderDetail';

// 3D Configurator (original App content)
import NailConfigurator from './NailConfigurator';
import ChatWidget from './components/ChatWidget';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Override global alert to use beautiful toast notifications
window.alert = (message) => {
  if (!message) return;
  const lowerMsg = message.toString().toLowerCase();
  if (lowerMsg.includes('error') || lowerMsg.includes('fail') || lowerMsg.includes('expired') || lowerMsg.includes('not allowed') || lowerMsg.includes('invalid')) {
    toast.error(message);
  } else if (lowerMsg.includes('success') || lowerMsg.includes('thành công')) {
    toast.success(message);
  } else {
    toast.info(message);
  }
};

export default function App() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Routes>
        <Route path="/"                    element={<Home />} />
      <Route path="/home"                element={<Home />} />
      <Route path="/aboutus"             element={<AboutUs />} />
      <Route path="/custom"              element={<Custom />} />
      <Route path="/booking"             element={<Booking />} />
      <Route path="/gallery"             element={<Gallery />} />
      <Route path="/social"              element={<Social />} />
      <Route path="/login"               element={<Login />} />
      <Route path="/signup"              element={<Signup />} />
      <Route path="/profile"             element={<UserProfile />} />
      <Route path="/order/:id"           element={<OrderDetail />} />
      <Route path="/naildesign3d"        element={<NailDesign3D />} />
      <Route path="/socialdetail"        element={<SocialDetail />} />
      <Route path="/salondetail"         element={<SalonDetail />} />
      <Route path="/bookingdesignpayment" element={<BookingDesignPayment />} />
      <Route path="/nailboxproducts"     element={<NailBoxProducts />} />
      <Route path="/nailboxdetail"       element={<NailBoxDetail />} />
      <Route path="/nailboxpayment"      element={<NailBoxPayment />} />
      <Route path="/technicans"          element={<Technicans />} />
      <Route path="/reviews"             element={<Reviews />} />
      <Route path="/location"            element={<Location />} />
      <Route path="/create-request"      element={<CreateRequest />} />
      <Route path="/my-requests"         element={<MyRequests />} />
      <Route path="/my-offers"           element={<MyOffers />} />
      <Route path="/schedule-appointment" element={<ScheduleAppointment />} />
      <Route path="/salon-appointments" element={<SalonAppointments />} />
      <Route path="/salon-members"      element={<SalonMembers />} />
      <Route path="/user-appointments"  element={<UserAppointments />} />
      <Route path="/salon-edit"         element={<SalonProfileEdit />} />
      <Route path="/book-appointment"   element={<BookAppointment />} />
      <Route path="/pricing"            element={<Pricing />} />
      <Route path="/payment"            element={<Payment />} />
      <Route path="/admin/subscriptions" element={<AdminDashboard />} />
      <Route path="/admin/dashboard"     element={<AdminDashboard />} />
      <Route path="/3d-configurator"     element={<NailConfigurator />} />
      </Routes>
      <ChatWidget />
    </>
  );
}