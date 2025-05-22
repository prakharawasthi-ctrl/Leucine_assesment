import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [view, setView] = useState('create');
  const [requests, setRequests] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    accessLevels: 'admin' // Set default to admin
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Access level options
  const accessLevelOptions = ['admin', 'manager', 'employee'];

  // 🔄 Fetch all requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/software', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setMessage('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch all software
  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/software', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSoftwareList(res.data.software || []);
    } catch (err) {
      console.error('Error fetching software:', err);
      setMessage('Failed to fetch software list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'requests') {
      fetchRequests();
    } else if (view === 'manage') {
      fetchSoftware();
    }
  }, [view]);

  // 📝 Handle form inputs
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🚀 Submit new software
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        accessLevels: [formData.accessLevels], // Convert to array
      };

      const res = await axios.post('http://localhost:5000/api/admin/software', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.msg || 'Software created successfully');
      setFormData({ name: '', description: '', accessLevels: 'admin' });
      
      // Refresh software list if we're on manage view
      if (view === 'manage') {
        fetchSoftware();
      }
    } catch (err) {
      console.error('Error creating software:', err);
      setMessage(err.response?.data?.msg || err.response?.data?.error || 'Failed to create software');
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete software
  const deleteSoftware = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/software/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.msg || 'Software deleted successfully');
      fetchSoftware(); // Refresh the list
    } catch (err) {
      console.error('Error deleting software:', err);
      setMessage(err.response?.data?.msg || 'Failed to delete software');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update request status (Approve/Reject)
  const updateRequestStatus = async (id, status) => {
    setLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/software/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.msg || `Request ${status}`);
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  // ❌ Delete request
  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.delete(`http://localhost:5000/api/admin/software/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.msg || 'Request deleted');
      fetchRequests();
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to delete request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-6 rounded shadow-md max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Dashboard</h1>

        {/* 🔁 Toggle View */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            ➕ Create Software
          </button>
          <button
            onClick={() => setView('manage')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            📋 Manage Software
          </button>
          <button
            onClick={() => setView('requests')}
            className={`px-4 py-2 rounded transition-colors ${
              view === 'requests' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            📝 Manage Requests
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        )}

        {/* 📄 Create Software Form */}
        {view === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              name="name"
              placeholder="Software Name"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <textarea
              name="description"
              placeholder="Description"
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div>
              <label htmlFor="accessLevels" className="block text-sm font-medium text-gray-700 mb-1">
                Access Level
              </label>
              <select
                name="accessLevels"
                id="accessLevels"
                value={formData.accessLevels}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                {accessLevelOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Software'}
            </button>
          </form>
        )}

        {/* 📋 Software Management Table */}
        {view === 'manage' && (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Software List</h2>
              <button
                onClick={fetchSoftware}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
            
            <table className="min-w-full bg-white border border-gray-300 rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 border-b font-semibold">ID</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Name</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Description</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Access Levels</th>
                  <th className="text-center py-3 px-4 border-b font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {softwareList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      {loading ? 'Loading software...' : 'No software found.'}
                    </td>
                  </tr>
                ) : (
                  softwareList.map((software) => (
                    <tr key={software.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b">{software.id}</td>
                      <td className="py-3 px-4 border-b">
                        <span className="font-medium text-gray-900">{software.name}</span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="max-w-xs truncate" title={software.description}>
                          {software.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {Array.isArray(software.accessLevels) 
                            ? software.accessLevels.join(', ') 
                            : software.accessLevels || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b text-center">
                        <button
                          onClick={() => deleteSoftware(software.id, software.name)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={loading}
                          title={`Delete ${software.name}`}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {softwareList.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Total Software: {softwareList.length}
              </div>
            )}
          </div>
        )}

        {/* 📋 Requests Table */}
        {view === 'requests' && (
          <div className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Access Requests</h2>
              <button
                onClick={fetchRequests}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
            
            <table className="min-w-full bg-white border border-gray-300 rounded">
              <thead className="bg-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 border-b font-semibold">Request ID</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">User</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Software</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Access Type</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Reason</th>
                  <th className="text-left py-3 px-4 border-b font-semibold">Status</th>
                  <th className="text-center py-3 px-4 border-b font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {loading ? 'Loading requests...' : 'No requests found.'}
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 border-b">
                        <span className="font-mono text-sm">{req._id}</span>
                      </td>
                      <td className="py-3 px-4 border-b">{req.user?.name || 'N/A'}</td>
                      <td className="py-3 px-4 border-b">{req.software?.name || 'N/A'}</td>
                      <td className="py-3 px-4 border-b">{req.accessType}</td>
                      <td className="py-3 px-4 border-b">
                        <div className="max-w-xs truncate" title={req.reason}>
                          {req.reason || '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <div className="flex justify-center gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateRequestStatus(req._id, 'Approved')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                                disabled={loading}
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => updateRequestStatus(req._id, 'Rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                                disabled={loading}
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => deleteRequest(req._id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors disabled:opacity-50"
                            disabled={loading}
                            title="Delete request"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {requests.length > 0 && (
              <div className="mt-4 text-sm text-gray-600 text-center">
                Total Requests: {requests.length}
              </div>
            )}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium transition-all ${
            message.includes('successfully') || message.includes('created') || message.includes('deleted') || message.includes('Approved')
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message}
            <button
              onClick={() => setMessage('')}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;