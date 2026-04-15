import { findUserById, updateUser } from '../models/User.js';

/**
 * Verification Controller — document upload, status check, and admin review.
 */

// ─── Upload ID document (mock) ──────────────────────────
export const uploadDocument = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (currentUser.verification && currentUser.verification.status === 'verified') {
      return res.status(400).json({ success: false, message: 'Already verified' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const mockUrl = `/uploads/verification/${req.file.filename}`;
    await updateUser(currentUser._id, {
      verification: { documentUrl: mockUrl, status: 'pending' },
    });

    return res.json({
      success: true, message: 'Document uploaded — pending admin review',
      data: { documentUrl: mockUrl, status: 'pending' },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Check verification status ──────────────────────────
export const getVerificationStatus = async (req, res, next) => {
  try {
    // Use req.user directly — already populated by middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    return res.json({ 
      success: true, 
      data: user.verification || { status: 'unverified', documentUrl: null, reviewedBy: null, reviewedAt: null },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Admin: approve or reject ───────────────────────────
export const adminVerifyUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false, message: 'action must be "approve" or "reject"',
      });
    }

    const user = await findUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updated = await updateUser(user._id, {
      verification: {
        ...(user.verification || {}),
        status: action === 'approve' ? 'verified' : 'rejected',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: `User ${action === 'approve' ? 'verified' : 'rejected'} successfully`,
      data: updated.verification,
    });
  } catch (error) {
    next(error);
  }
};
