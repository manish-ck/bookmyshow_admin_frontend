import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.shows;
const MOVIE_URL = API_ENDPOINTS.movies;
const SCREEN_URL = API_ENDPOINTS.screens;

function Shows() {
    const [shows, setShows] = useState([]);
    const [movies, setMovies] = useState([]);
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingShow, setEditingShow] = useState(null);

    const fetchShows = async () => {
        try {
            setLoading(true);
            setError(null);
            const [showsRes, moviesRes, screensRes] = await Promise.all([
                axios.get(API_URL),
                axios.get(MOVIE_URL),
                axios.get(SCREEN_URL)
            ]);
            setShows(showsRes.data.data || []);
            setMovies(moviesRes.data.data || []);
            setScreens(screensRes.data.data || []);
        } catch (err) {
            console.error('Error fetching shows:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    const handleAdd = () => {
        setEditingShow(null);
        setDialogOpen(true);
    };

    const handleEdit = (show) => {
        setEditingShow(show);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingShow(null);
        fetchShows();
    };

    const getMovieName = (movieId) => {
        const movie = movies.find((m) => m.id === movieId);
        return movie ? movie.title : `Movie #${movieId}`;
    };

    const getScreenName = (screenId) => {
        const screen = screens.find((s) => s.id === screenId);
        return screen ? screen.name : `Screen #${screenId}`;
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Show Schedules</h1>
                    <p className="page-subtitle">Schedule movie screenings, showtimes, and tier pricing</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchShows}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                    >
                        + Add Show
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching shows from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchShows}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : shows.length === 0 ? (
                <div className="state-container">
                    <p>No shows scheduled in database.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                        Schedule First Show
                    </button>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Movie</th>
                                <th>Screen</th>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Pricing Tiers</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {shows.map((show) => (
                                <tr key={show.id}>
                                    <td>
                                        <strong>{getMovieName(show.movie_id)}</strong>
                                    </td>
                                    <td>{getScreenName(show.screen_id)}</td>
                                    <td>{new Date(show.start_time).toLocaleString()}</td>
                                    <td>{new Date(show.end_time).toLocaleString()}</td>
                                    <td>
                                        {show.pricing
                                            ? Object.entries(show.pricing)
                                                  .map(([type, price]) => `${type}: ₹${price}`)
                                                  .join(' | ')
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge ${show.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {show.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(show)}
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
                <ShowDialog
                    show={editingShow}
                    movies={movies}
                    screens={screens}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function ShowDialog({ show, movies, screens, onClose, onSaved }) {
    const [form, setForm] = useState({
        movie_id: show?.movie_id || '',
        screen_id: show?.screen_id || '',
        start_time: show?.start_time
            ? new Date(show.start_time).toISOString().slice(0, 16)
            : '',
        end_time: show?.end_time
            ? new Date(show.end_time).toISOString().slice(0, 16)
            : '',
        pricing: show?.pricing
            ? JSON.stringify(show.pricing, null, 2)
            : '{\n  "REGULAR": 200,\n  "PREMIUM": 300\n}',
        status: show?.status ?? true
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

            let pricing;
            try {
                pricing = JSON.parse(form.pricing);
            } catch (err) {
                alert('Pricing must be valid JSON: ' + err.message);
                return;
            }

            const payload = {
                movie_id: Number(form.movie_id),
                screen_id: Number(form.screen_id),
                start_time: form.start_time,
                end_time: form.end_time,
                pricing,
                status: form.status
            };

            if (show) {
                await axios.patch(`${API_URL}/${show.id}`, payload);
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
                    <h2 className="modal-title">{show ? 'Edit Show' : 'Schedule Show'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Movie</label>
                            <select
                                className="form-control"
                                name="movie_id"
                                value={form.movie_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Movie</option>
                                {movies.map((movie) => (
                                    <option key={movie.id} value={movie.id}>
                                        {movie.title}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                <label className="form-label">Start Time</label>
                                <input
                                    className="form-control"
                                    type="datetime-local"
                                    name="start_time"
                                    value={form.start_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">End Time</label>
                                <input
                                    className="form-control"
                                    type="datetime-local"
                                    name="end_time"
                                    value={form.end_time}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Pricing Configuration (JSON)</label>
                            <textarea
                                className="form-control"
                                name="pricing"
                                value={form.pricing}
                                onChange={handleChange}
                                rows="5"
                                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
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
                            {loading ? 'Saving...' : show ? 'Update Show' : 'Schedule Show'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Shows;