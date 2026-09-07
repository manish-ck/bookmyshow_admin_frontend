import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.theatres;

function Theatres() {
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTheatre, setEditingTheatre] = useState(null);

    const fetchTheatres = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            setTheatres(response.data.data || []);
        } catch (err) {
            console.error('Error fetching theatres:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTheatres();
    }, []);

    const handleAdd = () => {
        setEditingTheatre(null);
        setDialogOpen(true);
    };

    const handleEdit = (theatre) => {
        setEditingTheatre(theatre);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingTheatre(null);
        fetchTheatres();
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Theatres Management</h1>
                    <p className="page-subtitle">Manage cinema halls, venues, and city locations</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchTheatres}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                    >
                        + Add Theatre
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching theatres from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchTheatres}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : theatres.length === 0 ? (
                <div className="state-container">
                    <p>No theatres found in database.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                        Add Your First Theatre
                    </button>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>City</th>
                                <th>Location</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {theatres.map((theatre) => (
                                <tr key={theatre.id}>
                                    <td>
                                        <strong>{theatre.name}</strong>
                                    </td>
                                    <td>{theatre.city}</td>
                                    <td>{theatre.location}</td>
                                    <td>{theatre.address}</td>
                                    <td>
                                        <span className={`badge ${theatre.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {theatre.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(theatre)}
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
                <TheatreDialog
                    theatre={editingTheatre}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function TheatreDialog({ theatre, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: theatre?.name || '',
        location: theatre?.location || '',
        address: theatre?.address || '',
        city: theatre?.city || '',
        status: theatre?.status ?? true
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
                location: form.location,
                address: form.address,
                city: form.city,
                status: form.status
            };

            if (theatre) {
                await axios.patch(`${API_URL}/${theatre.id}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }

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
                    <h2 className="modal-title">{theatre ? 'Edit Theatre' : 'Add Theatre'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Theatre Name</label>
                            <input
                                className="form-control"
                                name="name"
                                placeholder="e.g. PVR Cinemas Nexus"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">City</label>
                            <input
                                className="form-control"
                                name="city"
                                placeholder="e.g. Mumbai, Delhi, Bengaluru"
                                value={form.city}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Location / Area</label>
                            <textarea
                                className="form-control"
                                name="location"
                                placeholder="e.g. Koramangala 5th Block"
                                value={form.location}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Complete Address</label>
                            <textarea
                                className="form-control"
                                name="address"
                                placeholder="Street address, landmarks..."
                                value={form.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Status</label>
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
                            {loading ? 'Saving...' : theatre ? 'Update Theatre' : 'Create Theatre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Theatres;