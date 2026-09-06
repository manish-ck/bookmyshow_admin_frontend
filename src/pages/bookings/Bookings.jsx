import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.bookings;

function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            setBookings(response.data.data || []);
        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(
                err.response?.data?.message ||
                'Failed to load bookings from backend (port 8000). Please check connection.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'CONFIRMED' || s === 'SUCCESS') {
            return <span className="badge badge-success">{status}</span>;
        }
        if (s === 'PENDING') {
            return <span className="badge badge-pending">{status}</span>;
        }
        return <span className="badge badge-failed">{status || 'UNKNOWN'}</span>;
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Ticket Bookings</h1>
                    <p className="page-subtitle">Track customer ticket reservations, amounts, and statuses</p>
                </div>

                <div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchBookings}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={fetchBookings}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching bookings from port 8000...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="state-container">
                    <p>No bookings found in database.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Booking Reference</th>
                                <th>User ID</th>
                                <th>Show ID</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Booking Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <code>{booking.booking_reference}</code>
                                    </td>
                                    <td>#{booking.user_id}</td>
                                    <td>#{booking.show_id}</td>
                                    <td>
                                        <strong>₹{Number(booking.total_amount || 0).toLocaleString('en-IN')}</strong>
                                    </td>
                                    <td>{getStatusBadge(booking.status)}</td>
                                    <td>
                                        {booking.createdAt
                                            ? new Date(booking.createdAt).toLocaleString()
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Bookings;