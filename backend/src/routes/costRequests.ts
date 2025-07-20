import { Router } from 'express';
import { authenticate, requireManager } from '../middleware/auth';
import { prisma } from '../utils/database';
import { IAuthenticatedRequest } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all cost requests
router.get('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const { status, projectId, category } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;

    const costRequests = await prisma.costRequest.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: costRequests
    });
  } catch (error) {
    console.error('Error fetching cost requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cost requests'
    });
  }
});

// Get cost request by ID
router.get('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const costRequest = await prisma.costRequest.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!costRequest) {
      res.status(404).json({
        success: false,
        message: 'Cost request not found'
      });
      return;
    }

    res.json({
      success: true,
      data: costRequest
    });
  } catch (error) {
    console.error('Error fetching cost request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cost request'
    });
  }
});

// Create new cost request
router.post('/', async (req: IAuthenticatedRequest, res) => {
  try {
    const { projectId, title, description, amount, currency, category } = req.body;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const requestedBy = req.user.id;

    if (!projectId || !title || !amount || !category) {
      res.status(400).json({
        success: false,
        message: 'Project ID, title, amount, and category are required'
      });
      return;
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
      return;
    }

    const costRequest = await prisma.costRequest.create({
      data: {
        projectId,
        title,
        description,
        amount: parseFloat(amount),
        currency: currency || 'THB',
        category,
        requesterId: requestedBy
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: costRequest
    });
  } catch (error) {
    console.error('Error creating cost request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create cost request'
    });
  }
});

// Update cost request
router.put('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, currency, category } = req.body;

    // Check if user can edit this request
    const existingRequest = await prisma.costRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      res.status(404).json({
        success: false,
        message: 'Cost request not found'
      });
      return;
    }

    // Only requester can edit pending requests
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (existingRequest.status !== 'PENDING' || existingRequest.requesterId !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'You can only edit pending requests that you created'
      });
      return;
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) {
      if (amount <= 0) {
        res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
        return;
      }
      updateData.amount = parseFloat(amount);
    }
    if (currency) updateData.currency = currency;
    if (category) updateData.category = category;

    const costRequest = await prisma.costRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: costRequest
    });
  } catch (error) {
    console.error('Error updating cost request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cost request'
    });
  }
});

// Approve/Reject cost request (VP only)
import { requireRole } from '../middleware/auth';
router.patch('/:id/approve', requireRole('VP'), async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const approvedBy = req.user.id;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be APPROVED or REJECTED'
      });
      return;
    }

    if (status === 'REJECTED' && !rejectionReason) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a request'
      });
      return;
    }

    const updateData: any = {
      status,
      approvedBy,
      approvedAt: new Date()
    };

    if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason;
    }

    const costRequest = await prisma.costRequest.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        requester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: costRequest
    });
  } catch (error) {
    console.error('Error approving/rejecting cost request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve/reject cost request'
    });
  }
});

// Delete cost request
router.delete('/:id', async (req: IAuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user can delete this request
    const existingRequest = await prisma.costRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      res.status(404).json({
        success: false,
        message: 'Cost request not found'
      });
      return;
    }

    // Only requester can delete pending requests
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    if (existingRequest.status !== 'PENDING' || existingRequest.requesterId !== req.user?.id) {
      res.status(403).json({
        success: false,
        message: 'You can only delete pending requests that you created'
      });
      return;
    }

    await prisma.costRequest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Cost request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cost request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cost request'
    });
  }
});

export default router; 