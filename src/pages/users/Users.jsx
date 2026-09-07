import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.users;

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            setUsers(response.data.data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleEdit = (user) => {
        setEditingUser(user);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingUser(null);
        fetchUsers();
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Registered Users</h1>
                    <p className="page-subtitle">View customer accounts, contact details, and account statuses</p>
                </div>

                <div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchUsers}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching users from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchUsers}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : users.length === 0 ? (
                <div className="state-container">
                    <p>No registered users found in database.</p>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <strong>{user.name}</strong>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>
                                        <span className={`badge ${user.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {user.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {dialogOpen && (
                <UserDialog
                    user={editingUser}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function UserDialog({ user, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        status: user?.status ?? true
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                status: form.status
            };

            await axios.patch(`${API_URL}/${user.id}`, payload);
            onSaved();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Edit User Profile</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-control"
                                name="name"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-control"
                                type="email"
                                name="email"
                                placeholder="name@example.com"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Phone Number</label>
                            <input
                                className="form-control"
                                name="phone"
                                placeholder="+91 9876543210"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Account Status</label>
                            <select
                                className="form-control"
                                name="status"
                                value={String(form.status)}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        status: e.target.value === 'true'
                                    }))
                                }
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Update User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Users;