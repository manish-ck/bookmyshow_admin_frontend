import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Movies', path: '/admin/movie', icon: '🎬' },
    { label: 'Theatres', path: '/admin/theatre', icon: '🏛️' },
    { label: 'Screens', path: '/admin/screen', icon: '🖥️' },
    { label: 'Seats', path: '/admin/seat', icon: '💺' },
    { label: 'Shows', path: '/admin/shows', icon: '🕒' },
    { label: 'Users', path: '/admin/user', icon: '👥' },
    { label: 'Bookings', path: '/admin/booking', icon: '🎟️' },
    { label: 'Transactions', path: '/admin/transaction', icon: '💳' },
];

function AdminLayout() {
    const location = useLocation();

    // Find current active item for top header title
    const currentItem = NAV_ITEMS.find((item) =>
        location.pathname.startsWith(item.path)
    ) || NAV_ITEMS[0];

    return (
        <div className="app-shell">
            {/* Left Sidebar Navigation */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="sidebar-brand-icon">🎬</span>
                        <span>BookMyShow</span>
                    </div>
                    <span className="sidebar-sub">Admin Console</span>
                </div>

                <nav className="sidebar-nav">
                    <span className="nav-section-title">Navigation Tabs</span>

                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-tab-btn ${isActive ? 'active' : ''}`
                            }
                        >
                            <span className="sidebar-tab-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <span>Backend</span>
                    <span className="port-indicator" title={`Connected to ${API_BASE_URL}`}>
                        <span className="port-dot"></span>
                        Port 8000
                    </span>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-wrapper">
                <header className="top-navbar">
                    <div className="current-tab-title">
                        <span>{currentItem.icon}</span>
                        <span>{currentItem.label}</span>
                    </div>

                    <div className="top-actions">
                        <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => window.location.reload()}
                            title="Reload active view and refetch data"
                        >
                            🔄 Refresh Data
                        </button>
                    </div>
                </header>

                <main className="content-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
