import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const [softwareList, setSoftwareList] = useState([]);
  const [softwareId, setSoftwareId] = useState('');
  const [accessType, setAccessType] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'Employee') {
      navigate('/login');
      return;
    }

    const fetchSoftware = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await fetch('http://localhost:5000/api/admin/software', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Fetched software list:', data);

        // Handle different response formats
        let softwareArray = [];
        if (Array.isArray(data)) {
          softwareArray = data;
        } else if (data && Array.isArray(data.software)) {
          softwareArray = data.software;
        } else if (data && Array.isArray(data.data)) {
          softwareArray = data.data;
        } else if (data && typeof data === 'object') {
          // If it's an object, try to extract software list
          const possibleArrays = Object.values(data).filter(Array.isArray);
          if (possibleArrays.length > 0) {
            softwareArray = possibleArrays[0];
          }
        }

        // Ensure each software item has required properties
        const validSoftware = softwareArray.filter(item => 
          item && 
          (item.id || item._id) && 
          (item.name || item.title || item.software_name)
        ).map(item => ({
          id: item.id || item._id,
          name: item.name || item.title || item.software_name,
          description: item.description || '',
          ...item
        }));

        setSoftwareList(validSoftware);
        console.log('Processed software list:', validSoftware);

        if (validSoftware.length === 0) {
          setError('No software available or invalid data format');
        }

      } catch (err) {
        console.error('Error fetching software:', err);
        setError(`Error loading software list: ${err.message}`);
        setSoftwareList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSoftware();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!softwareId || !accessType || !reason.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const payload = {
      softwareId: parseInt(softwareId, 10),
      accessType,
      reason: reason.trim(),
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Access request submitted successfully!');
        setSoftwareId('');
        setAccessType('');
        setReason('');
      } else {
        alert(`Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (err) {
      console.error('Submit Error:', err);
      alert('Failed to submit access request.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        marginTop: 50, 
        padding: 20,
        fontSize: '16px'
      }}>
        Loading software...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Software Access Request</h2>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        Available Software: {softwareList.length} items
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label style={{ display: 'block', marginBottom: '15px' }}>
          Software:
          <select
            value={softwareId}
            onChange={(e) => {
              console.log('Selected software ID:', e.target.value);
              setSoftwareId(e.target.value);
            }}
            required
            style={{ 
              display: 'block', 
              width: '100%', 
              marginTop: 5, 
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- Select Software --</option>
            {softwareList.length > 0 ? (
              softwareList.map((software) => (
                <option key={software.id} value={software.id}>
                  {software.name}
                  {software.description && ` - ${software.description}`}
                </option>
              ))
            ) : (
              <option disabled>No software available</option>
            )}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: '15px' }}>
          Access Type:
          <select
            value={accessType}
            onChange={(e) => setAccessType(e.target.value)}
            required
            style={{ 
              display: 'block', 
              width: '100%', 
              marginTop: 5, 
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            <option value="">-- Select Access Type --</option>
            <option value="Read">Read</option>
            <option value="Write">Write</option>
            <option value="Admin">Admin</option>
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: '15px' }}>
          Reason:
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Explain your reason for access"
            required
            style={{ 
              display: 'block', 
              width: '100%', 
              marginTop: 5,
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading || softwareList.length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: softwareList.length === 0 ? '#ccc' : '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: softwareList.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
