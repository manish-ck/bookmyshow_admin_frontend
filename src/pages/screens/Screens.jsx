import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.screens;
const THEATRE_URL = API_ENDPOINTS.theatres;

function Screens() {
    const [screens, setScreens] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingScreen, setEditingScreen] = useState(null);

    const fetchScreens = async () => {
        try {
            setLoading(true);
            setError(null);
            const [screensRes, theatresRes] = await Promise.all([
                axios.get(API_URL),
                axios.get(THEATRE_URL)
            ]);
            setScreens(screensRes.data.data || []);
            setTheatres(theatresRes.data.data || []);
        } catch (err) {
            console.error('Error fetching screens:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchScreens();
    }, []);

    const handleAdd = () => {
        setEditingScreen(null);
        setDialogOpen(true);
    };

    const handleEdit = (screen) => {
        setEditingScreen(screen);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingScreen(null);
        fetchScreens();
    };

    const getTheatreName = (theatreId) => {
        const theatre = theatres.find((t) => t.id === theatreId);
        return theatre ? theatre.name : `Theatre #${theatreId}`;
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Screens Management</h1>
                    <p className="page-subtitle">Configure auditorium screens, seating capacities, and formats</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchScreens}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                    >
                        + Add Screen
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching screens from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchScreens}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : screens.length === 0 ? (
                <div className="state-container">
                    <p>No screens found in database.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                        Add Your First Screen
                    </button>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Theatre</th>
                                <th>Type / Format</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {screens.map((screen) => (
                                <tr key={screen.id}>
                                    <td>
                                        <strong>{screen.name}</strong>
                                    </td>
                                    <td>{getTheatreName(screen.theatre_id)}</td>
                                    <td>
                                        <span className="badge badge-inactive">{screen.type}</span>
                                    </td>
                                    <td>{screen.capacity} seats</td>
                                    <td>
                                        <span className={`badge ${screen.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {screen.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(screen)}
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
                <ScreenDialog
                    screen={editingScreen}
                    theatres={theatres}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function ScreenDialog({ screen, theatres, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: screen?.name || '',
        theatre_id: screen?.theatre_id || '',
        type: screen?.type || '',
        capacity: screen?.capacity || '',
        status: screen?.status ?? true
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
                theatre_id: Number(form.theatre_id),
                type: form.type,
                capacity: Number(form.capacity),
                status: form.status
            };

            if (screen) {
                await axios.patch(`${API_URL}/${screen.id}`, payload);
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
                    <h2 className="modal-title">{screen ? 'Edit Screen' : 'Add Screen'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Screen Name</label>
                            <input
                                className="form-control"
                                name="name"
                                placeholder="e.g. Screen 1, Audi 2, IMAX Hall"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Theatre</label>
                            <select
                                className="form-control"
                                name="theatre_id"
                                value={form.theatre_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Theatre</option>
                                {theatres.map((theatre) => (
                                    <option key={theatre.id} value={theatre.id}>
                                        {theatre.name} ({theatre.city})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Type / Format</label>
                            <input
                                className="form-control"
                                name="type"
                                placeholder="e.g. IMAX, 2D, 3D, 4DX"
                                value={form.type}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Capacity (Seats)</label>
                            <input
                                className="form-control"
                                type="number"
                                name="capacity"
                                placeholder="Total number of seats"
                                value={form.capacity}
                                onChange={handleChange}
                                min="1"
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
                            {loading ? 'Saving...' : screen ? 'Update Screen' : 'Create Screen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Screens;