import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RoomsPage from './pages/RoomsPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
   <BrowserRouter>
         <Navbar hotelName="Grand Plaza Hotel" />
         <Routes>
                 <Route path="/" element={<LoginPage />} />
                 <Route path="/register" element={<RegisterPage/>}/>
                 <Route path="/login" element={<LoginPage />} />
                 <Route path="/rooms" element={<PrivateRoute><RoomsPage /></PrivateRoute>} />
                 <Route path="/booking/:roomId" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
                 <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                 <Route path="/admin/login" element={<AdminLoginPage />} />
                 <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
         </Routes>
       </BrowserRouter>
  );
}

export default App;