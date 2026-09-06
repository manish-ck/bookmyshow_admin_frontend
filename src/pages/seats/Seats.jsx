import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.seats;
const SCREEN_URL = API_ENDPOINTS.screens;

function Seats() {
    const [seats, setSeats] = useState([]);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSeat, setEditingSeat] = useState(null);

    const fetchSeats = async () => {
        try {
            setLoading(true);
            setError(null);
            const [seatsRes, screensRes] = await Promise.all([
                axios.get(API_URL),
                axios.get(SCREEN_URL)
            ]);
            setSeats(seatsRes.data.data || []);
            setScreens(screensRes.data.data || []);
        } catch (err) {
            console.error('Error fetching seats:', err);
            setError(
                err.response?.data?.message ||
                'Failed to load seats from backend (port 8000). Please check connection.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSeats();
    }, []);

    const handleAdd = () => {
        setEditingSeat(null);
        setDialogOpen(true);
    };

    const handleEdit = (seat) => {
        setEditingSeat(seat);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingSeat(null);
        fetchSeats();
    };

    const getScreenName = (screenId) => {
        const screen = screens.find((s) => s.id === screenId);
        return screen ? screen.name : `Screen #${screenId}`;
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Seats Management</h1>
                    <p className="page-subtitle">Configure rows, seat numbers, and seating tiers</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchSeats}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                    >
                        + Add Seat
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-banner">
                    <span>⚠️ {error}</span>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={fetchSeats}>
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching seats from port 8000...</p>
                </div>
            ) : seats.length === 0 ? (
                <div className="state-container">
                    <p>No seats configured in database.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                        Add First Seat
                    </button>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Screen</th>
                                <th>Row</th>
                                <th>Seat Number</th>
                                <th>Seat Code</th>
                                <th>Type / Tier</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {seats.map((seat) => (
                                <tr key={seat.id}>
                                    <td>
                                        <strong>{getScreenName(seat.screen_id)}</strong>
                                    </td>
                                    <td>{seat.row}</td>
                                    <td>{seat.number}</td>
                                    <td>
                                        <span className="badge badge-inactive">{`${seat.row}${seat.number}`}</span>
                                    </td>
                                    <td>
                                        <span className="badge badge-pending">{seat.type}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${seat.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {seat.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(seat)}
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
                <SeatDialog
                    seat={editingSeat}
                    screens={screens}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function SeatDialog({ seat, screens, onClose, onSaved }) {
    const [form, setForm] = useState({
        screen_id: seat?.screen_id || '',
        row: seat?.row || '',
        number: seat?.number || '',
        type: seat?.type || '',
        status: seat?.status ?? true
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
                screen_id: Number(form.screen_id),
                row: form.row,
                number: Number(form.number),
                type: form.type,
                status: form.status
            };

            if (seat) {
                await axios.patch(`${API_URL}/${seat.id}`, payload);
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
                    <h2 className="modal-title">{seat ? 'Edit Seat' : 'Add Seat'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Screen</label>
                            <select
                                className="form-control"
                                name="screen_id"
                                value={form.screen_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Screen</option>
                                {screens.map((screen) => (
                                    <option key={screen.id} value={screen.id}>
                                        {screen.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-field">
                                <label className="form-label">Row Identifier</label>
                                <input
                                    className="form-control"
                                    name="row"
                                    placeholder="e.g. A, B, C"
                                    value={form.row}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Seat Number</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    name="number"
                                    placeholder="e.g. 1, 2, 10"
                                    value={form.number}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Seat Type / Tier</label>
                            <input
                                className="form-control"
                                name="type"
                                placeholder="e.g. REGULAR, PREMIUM, RECLINER"
                                value={form.type}
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
                            {loading ? 'Saving...' : seat ? 'Update Seat' : 'Create Seat'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Seats;