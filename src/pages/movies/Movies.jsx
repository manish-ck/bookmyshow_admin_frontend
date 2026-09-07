import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.movies;

function Movies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);

    const fetchMovies = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            setMovies(response.data.data || []);
        } catch (err) {
            console.error('Error fetching movies:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    const handleAdd = () => {
        setEditingMovie(null);
        setDialogOpen(true);
    };

    const handleEdit = (movie) => {
        setEditingMovie(movie);
        setDialogOpen(true);
    };

    const handleSaved = () => {
        setDialogOpen(false);
        setEditingMovie(null);
        fetchMovies();
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Movies Management</h1>
                    <p className="page-subtitle">Manage catalog, movie details, and release statuses</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchMovies}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleAdd}
                    >
                        + Add Movie
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching movies from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchMovies}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : movies.length === 0 ? (
                <div className="state-container">
                    <p>No movies found in database.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                        Add Your First Movie
                    </button>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Poster</th>
                                <th>Title</th>
                                <th>Genre</th>
                                <th>Language</th>
                                <th>Duration</th>
                                <th>Release Date</th>
                                <th>Certification</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {movies.map((movie) => (
                                <tr key={movie.id}>
                                    <td>
                                        {movie.poster_url ? (
                                            <img
                                                src={movie.poster_url}
                                                alt={movie.title}
                                                className="poster-preview"
                                            />
                                        ) : (
                                            <span style={{ fontSize: '1.5rem' }}>🎬</span>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{movie.title}</strong>
                                    </td>
                                    <td>{movie.genre || '-'}</td>
                                    <td>
                                        {Array.isArray(movie.languages)
                                            ? movie.languages.join(', ')
                                            : movie.languages || '-'}
                                    </td>
                                    <td>{movie.duration ? `${movie.duration} min` : '-'}</td>
                                    <td>
                                        {movie.release_date
                                            ? new Date(movie.release_date).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td>{movie.certification || '-'}</td>
                                    <td>
                                        <span className={`badge ${movie.status ? 'badge-active' : 'badge-inactive'}`}>
                                            {movie.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleEdit(movie)}
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
                <MovieDialog
                    movie={editingMovie}
                    onClose={() => setDialogOpen(false)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}

function MovieDialog({ movie, onClose, onSaved }) {
    const [form, setForm] = useState({
        title: movie?.title || '',
        description: movie?.description || '',
        duration: movie?.duration || '',
        release_date: movie?.release_date
            ? movie.release_date.split('T')[0]
            : '',
        languages: Array.isArray(movie?.languages)
            ? movie.languages.join(', ')
            : movie?.languages || '',
        genre: movie?.genre || '',
        certification: movie?.certification || '',
        status: movie?.status ?? true,
        poster: null,
        trailer: null
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files[0]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('duration', form.duration);
            formData.append('release_date', form.release_date);
            formData.append(
                'languages',
                JSON.stringify(
                    form.languages
                        .split(',')
                        .map((language) => language.trim())
                        .filter(Boolean)
                )
            );
            formData.append('genre', form.genre);
            formData.append('certification', form.certification);
            formData.append('status', String(form.status));

            if (form.poster) {
                formData.append('poster', form.poster);
            }

            if (form.trailer) {
                formData.append('trailer', form.trailer);
            }

            if (movie) {
                await axios.patch(`${API_URL}/${movie.id}`, formData);
            } else {
                await axios.post(API_URL, formData);
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
                    <h2 className="modal-title">{movie ? 'Edit Movie' : 'Add Movie'}</h2>
                    <button type="button" className="modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-field">
                            <label className="form-label">Title</label>
                            <input
                                className="form-control"
                                name="title"
                                placeholder="Movie Title"
                                value={form.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                name="description"
                                placeholder="Movie Description"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-field">
                                <label className="form-label">Duration (minutes)</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    name="duration"
                                    placeholder="e.g. 150"
                                    value={form.duration}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Release Date</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    name="release_date"
                                    value={form.release_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Languages (comma-separated)</label>
                            <input
                                className="form-control"
                                name="languages"
                                placeholder="e.g. Hindi, English, Tamil"
                                value={form.languages}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-field">
                                <label className="form-label">Genre</label>
                                <input
                                    className="form-control"
                                    name="genre"
                                    placeholder="e.g. Action, Drama"
                                    value={form.genre}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Certification</label>
                                <input
                                    className="form-control"
                                    name="certification"
                                    placeholder="e.g. UA, A, U"
                                    value={form.certification}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="form-field">
                                <label className="form-label">Poster Image</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    name="poster"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required={!movie}
                                />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Trailer Video</label>
                                <input
                                    className="form-control"
                                    type="file"
                                    name="trailer"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                />
                            </div>
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
                            {loading ? 'Saving...' : movie ? 'Update Movie' : 'Create Movie'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Movies;