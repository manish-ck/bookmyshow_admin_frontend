import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

function Dashboard() {
    const [data, setData] = useState({
        movies: 0,
        theatres: 0,
        screens: 0,
        shows: 0,
        users: 0,
        bookings: 0,
        transactions: 0,
        revenue: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                moviesResponse,
                theatresResponse,
                screensResponse,
                showsResponse,
                usersResponse,
                bookingsResponse,
                transactionsResponse
            ] = await Promise.all([
                axios.get(API_ENDPOINTS.dashboard.movies),
                axios.get(API_ENDPOINTS.dashboard.theatres),
                axios.get(API_ENDPOINTS.dashboard.screens),
                axios.get(API_ENDPOINTS.dashboard.shows),
                axios.get(API_ENDPOINTS.dashboard.users),
                axios.get(API_ENDPOINTS.dashboard.bookings),
                axios.get(API_ENDPOINTS.dashboard.transactions)
            ]);

            const transactions = transactionsResponse.data.data || [];

            const revenue = transactions
                .filter((transaction) => transaction.status === 'SUCCESS')
                .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);

            setData({
                movies: moviesResponse.data.data?.length || 0,
                theatres: theatresResponse.data.data?.length || 0,
                screens: screensResponse.data.data?.length || 0,
                shows: showsResponse.data.data?.length || 0,
                users: usersResponse.data.data?.length || 0,
                bookings: bookingsResponse.data.data?.length || 0,
                transactions: transactions.length,
                revenue
            });
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Real-time platform metrics and activity summary</p>
                </div>

                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={fetchDashboardData}
                    disabled={loading}
                >
                    🔄 {loading ? 'Fetching...' : 'Refresh Metrics'}
                </button>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Loading platform metrics from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={fetchDashboardData}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            ) : (
                <div className="stats-grid">

                    <DashboardCard
                        title="Total Users"
                        value={data.users}
                        icon="👥"
                    />

                    <DashboardCard
                        title="Total Movies"
                        value={data.movies}
                        icon="🎬"
                    />

                    <DashboardCard
                        title="Total Theatres"
                        value={data.theatres}
                        icon="🏛️"
                    />

                    <DashboardCard
                        title="Total Screens"
                        value={data.screens}
                        icon="🖥️"
                    />

                    <DashboardCard
                        title="Total Shows"
                        value={data.shows}
                        icon="🕒"
                    />

                    <DashboardCard
                        title="Total Bookings"
                        value={data.bookings}
                        icon="🎟️"
                    />

                    <DashboardCard
                        title="Total Transactions"
                        value={data.transactions}
                        icon="💳"
                    />

                    <DashboardCard
                        title="Total Revenue"
                        value={`₹${data.revenue.toLocaleString('en-IN')}`}
                        icon="💰"
                        isRevenue
                    />
                </div>
            )}
        </div>
    );
}

function DashboardCard({ title, value, icon, isRevenue }) {
    return (
        <div className={`stat-card ${isRevenue ? 'stat-card-revenue' : ''}`}>
            <div className="stat-card-header">
                <span className="stat-card-title">{title}</span>
                {icon && <span className="stat-card-icon">{icon}</span>}
            </div>
            <p className="stat-card-value">{value}</p>
        </div>
    );
}

export default Dashboard;