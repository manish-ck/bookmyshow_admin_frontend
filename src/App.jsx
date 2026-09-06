import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Movies from './pages/movies/Movies';
import Theatres from './pages/theatres/Theatres';
import Screens from './pages/screens/Screens';
import Seats from './pages/seats/Seats';
import Shows from './pages/shows/Shows';
import Users from './pages/users/Users';
import Bookings from './pages/bookings/Bookings';
import Transactions from './pages/transactions/Transactions';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="movie" element={<Movies />} />
                    <Route path="theatre" element={<Theatres />} />
                    <Route path="screen" element={<Screens />} />
                    <Route path="seat" element={<Seats />} />
                    <Route path="shows" element={<Shows />} />
                    <Route path="user" element={<Users />} />
                    <Route path="booking" element={<Bookings />} />
                    <Route path="transaction" element={<Transactions />} />
                </Route>

                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;