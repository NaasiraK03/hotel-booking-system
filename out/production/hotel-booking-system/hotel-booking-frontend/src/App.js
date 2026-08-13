import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RoomsPage from './pages/RoomsPage';

function App() {
  return (
   <BrowserRouter>
         <Navbar hotelName="Grand Plaza Hotel" />
         <Routes>
                 <Route path="/" element={<LoginPage />} />
                 <Route path="/login" element={<LoginPage />} />
                 <Route path="/rooms" element={<RoomsPage />} />
         </Routes>
       </BrowserRouter>
  );
}

export default App;