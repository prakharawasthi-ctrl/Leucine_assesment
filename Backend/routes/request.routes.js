const express = require('express');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../data-source');
const { Request } = require('../entities/Request');
const { User } = require('../entities/User');
const { Software } = require('../entities/Software');

const router = express.Router();

// Middleware to authenticate and get user from token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.userId });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Create a new access request (Employee submits request)
// POST /api/request
router.post('/', authenticateToken, async (req, res) => {
  const { softwareId, accessType, reason } = req.body;
  
  console.log('Received request:', { softwareId, accessType, reason });
  console.log('User from token:', req.user.id, req.user.username);
  
  try {
    // Validate required fields
    if (!softwareId || !accessType || !reason) {
      return res.status(400).json({ 
        message: 'softwareId, accessType, and reason are required' 
      });
    }

    // Validate access type
    const validAccessTypes = ['Read', 'Write', 'Admin'];
    if (!validAccessTypes.includes(accessType)) {
      return res.status(400).json({ 
        message: 'Invalid access type. Must be Read, Write, or Admin' 
      });
    }

    const requestRepo = AppDataSource.getRepository(Request);
    const softwareRepo = AppDataSource.getRepository(Software);

    // Find the software
    const software = await softwareRepo.findOneBy({ id: parseInt(softwareId) });
    if (!software) {
      return res.status(400).json({ message: 'Software not found' });
    }

    console.log('Found software:', software.name);

    // Create the request object matching your entity schema
    const newRequest = {
      accessType: accessType,
      reason: reason.trim(),
      status: 'Pending', // Default status
      user: req.user,    // User from authentication
      software: software // Software found above
    };

    // Create and save the request
    const request = requestRepo.create(newRequest);
    const savedRequest = await requestRepo.save(request);

    console.log('Request saved with ID:', savedRequest.id);

    // Return success response that matches frontend expectations
    res.status(200).json({ 
      message: 'Access request submitted successfully!',
      success: true,
      request: {
        id: savedRequest.id,
        softwareId: software.id,
        softwareName: software.name,
        accessType: accessType,
        reason: reason.trim(),
        status: 'Pending'
      }
    });

  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ 
      message: 'Failed to submit access request',
      error: err.message 
    });
  }
});

// Get requests for the authenticated user (Employee's own requests)
// GET /api/request/my-requests
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const requestRepo = AppDataSource.getRepository(Request);
    
    // Since your entity has eager: true, the relations will be loaded automatically
    const requests = await requestRepo.find({
      where: { user: { id: req.user.id } },
      order: { id: 'DESC' } // Order by newest first
    });

    const formattedRequests = requests.map(request => ({
      id: request.id,
      softwareName: request.software.name,
      accessType: request.accessType,
      reason: request.reason,
      status: request.status,
      createdDate: request.id // Using ID as proxy for creation order
    }));

    res.json({ 
      requests: formattedRequests,
      count: formattedRequests.length 
    });
    
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({ 
      message: 'Error loading your requests', 
      error: err.message 
    });
  }
});

// Get all requests (Removed Admin/Manager restriction)
// GET /api/request/all
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const requestRepo = AppDataSource.getRepository(Request);
    
    // Get all requests with relations loaded automatically (eager: true)
    const requests = await requestRepo.find({
      order: { id: 'DESC' }
    });

    const formattedRequests = requests.map(request => ({
      id: request.id,
      userName: request.user.username,
      userEmail: request.user.email,
      softwareName: request.software.name,
      accessType: request.accessType,
      reason: request.reason,
      status: request.status
    }));

    res.json({ 
      requests: formattedRequests,
      count: formattedRequests.length 
    });
    
  } catch (err) {
    console.error('Error fetching all requests:', err);
    res.status(500).json({ 
      message: 'Error loading requests', 
      error: err.message 
    });
  }
});

// Update request status (Removed Admin/Manager restriction)
// PATCH /api/request/:id
router.patch('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be Pending, Approved, or Rejected' 
      });
    }

    const requestRepo = AppDataSource.getRepository(Request);
    
    // Find the request
    const request = await requestRepo.findOneBy({ id: parseInt(id) });
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update the status
    request.status = status;
    const updatedRequest = await requestRepo.save(request);

    res.json({ 
      message: 'Request status updated successfully',
      request: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        userName: updatedRequest.user.username,
        softwareName: updatedRequest.software.name
      }
    });
    
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ 
      message: 'Error updating request status', 
      error: err.message 
    });
  }
});

// Delete request (Removed Admin-only restriction)
// DELETE /api/request/:id
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const requestRepo = AppDataSource.getRepository(Request);
    const result = await requestRepo.delete({ id: parseInt(id) });

    if (result.affected === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ message: 'Request deleted successfully' });
    
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ 
      message: 'Error deleting request', 
      error: err.message 
    });
  }
});

// Get a single request by ID (Removed access restriction)
// GET /api/request/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const requestRepo = AppDataSource.getRepository(Request);
    const request = await requestRepo.findOneBy({ id: parseInt(id) });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Removed check for owner/admin/manager, any user can access

    const formattedRequest = {
      id: request.id,
      userName: request.user.username,
      userEmail: request.user.email,
      softwareName: request.software.name,
      accessType: request.accessType,
      reason: request.reason,
      status: request.status
    };

    res.json({ request: formattedRequest });
    
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({ 
      message: 'Error loading request', 
      error: err.message 
    });
  }
});

module.exports = router;
