import React, { useEffect, useState } from 'react';

export default function ManagerDashboard() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const token = localStorage.getItem('token');
  
  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/request/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied. You need Manager or Admin role to view requests.');
        } else if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else {
          throw new Error(data.message || 'Failed to fetch requests');
        }
      }

      const pendingRequests = (data.requests || []).filter(req => req.status === 'Pending');
      setRequests(pendingRequests);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const status = action === 'approve' ? 'Approved' : 'Rejected';
    setActionLoading(prev => ({ ...prev, [id]: action }));

    try {
      const res = await fetch(`http://localhost:5000/api/request/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Action failed');
      }

      alert(`Request ${action}d successfully!`);
      fetchRequests();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    } else {
      setError('No authentication token found. Please log in.');
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600 mb-6">Manage pending access requests</p>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading pending requests...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 text-lg mb-6">{error}</p>
            {error.includes('Access denied') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  <strong>Debug Info:</strong> Your user role might not be set to 'Manager' or 'Admin'.
                  Please check with your administrator.
                </p>
              </div>
            )}
            <div className="space-x-4">
              <button
                onClick={fetchRequests}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.reload();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg"
              >
                Re-login
              </button>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-16 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-500">All requests have been processed or no new requests have been submitted.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Pending Requests ({requests.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Software</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Access Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((req, index) => (
                    <tr key={req.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="px-6 py-4">{req.userName}</td>
                      <td className="px-6 py-4">{req.userEmail}</td>
                      <td className="px-6 py-4">{req.softwareName}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          req.accessType === 'Admin' ? 'bg-red-500' :
                          req.accessType === 'Write' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {req.accessType}
                        </span>
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={req.reason}>
                        {req.reason?.length > 40 ? `${req.reason.slice(0, 40)}...` : req.reason || 'No reason'}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">#{req.id}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          disabled={actionLoading[req.id] === 'approve'}
                          onClick={() => handleAction(req.id, 'approve')}
                          className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1 rounded disabled:opacity-50"
                        >
                          {actionLoading[req.id] === 'approve' ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          disabled={actionLoading[req.id] === 'reject'}
                          onClick={() => handleAction(req.id, 'reject')}
                          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-1 rounded disabled:opacity-50"
                        >
                          {actionLoading[req.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
