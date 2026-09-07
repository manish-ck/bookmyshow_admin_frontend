import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const API_URL = API_ENDPOINTS.transactions;

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(API_URL);
            setTransactions(response.data.data || []);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            const backendMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : null);
            setError(backendMsg || `Backend error: ${err.message || 'Unable to connect to port 8000'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        if (s === 'SUCCESS') {
            return <span className="badge badge-success">SUCCESS</span>;
        }
        if (s === 'PENDING') {
            return <span className="badge badge-pending">PENDING</span>;
        }
        return <span className="badge badge-failed">{status || 'FAILED'}</span>;
    };

    return (
        <div>
            <div className="page-toolbar">
                <div>
                    <h1 className="page-title">Payment Transactions</h1>
                    <p className="page-subtitle">Detailed ledger of payment gateways, amounts, and statuses</p>
                </div>

                <div>
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={fetchTransactions}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="state-container">
                    <div className="loading-spinner"></div>
                    <p>Fetching transactions from port 8000...</p>
                </div>
            ) : error ? (
                <div className="state-container">
                    <div className="error-banner" style={{ width: '100%', maxWidth: '750px' }}>
                        <span>⚠️ {error}</span>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={fetchTransactions}>
                            Retry
                        </button>
                    </div>
                </div>
            ) : transactions.length === 0 ? (
                <div className="state-container">
                    <p>No transactions found in database.</p>
                </div>
            ) : (
                <div className="table-container">

                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Booking ID</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Payment Status</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>

                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>
                                        <code>{transaction.transaction_id}</code>
                                    </td>
                                    <td>#{transaction.booking_id}</td>
                                    <td>
                                        <strong style={{ color: '#059669' }}>
                                            ₹{Number(transaction.amount || 0).toLocaleString('en-IN')}
                                        </strong>
                                    </td>
                                    <td>
                                        <span className="badge badge-inactive">
                                            {transaction.payment_method || 'CARD'}
                                        </span>
                                    </td>
                                    <td>{getStatusBadge(transaction.status)}</td>
                                    <td>
                                        {transaction.createdAt
                                            ? new Date(transaction.createdAt).toLocaleString()
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

export default Transactions;