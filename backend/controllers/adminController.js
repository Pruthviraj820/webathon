import { findUsers, countUsers, findUserById, updateUser } from '../models/User.js';
import { countReportsByUser, resolveReportsByUser } from '../models/Report.js';
import { detectFakeProfile } from '../utils/fakeDetection.js';

/**
 * Admin Controller — user management & moderation tools.
 */

// ─── Get all users (paginated, filterable) ──────────────
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const verificationStatus = req.query.verification;

    const filter = {};
    if (search) filter.search = search;
    if (verificationStatus) filter.verification_status = verificationStatus;

    const users = await findUsers(filter, {
      limit, offset: (page - 1) * limit, orderBy: '"createdAt" DESC',
    });
    const total = await countUsers(filter);

    const enriched = [];
    for (const user of users) {
      const reportCount = await countReportsByUser(user._id);
      const fakeCheck = detectFakeProfile(user, reportCount);
      enriched.push({ ...user, fakeProfileRisk: fakeCheck });
    }

    return res.json({
      success: true, page,
      totalPages: Math.ceil(total / limit),
      total, data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get verification docs for admin review ─────────────
export const getVerificationDocuments = async (req, res, next) => {
  try {
    const status = req.query.status || 'pending';
    const allowedStatuses = ['pending', 'verified', 'rejected', 'unverified', 'all'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status filter. Use pending, verified, rejected, unverified, or all.',
      });
    }

    const filter = {};
    if (status !== 'all') filter.verification_status = status;

    const users = findUsers(filter, { orderBy: 'updatedAt DESC' });
    const docs = users
      .filter((user) => Boolean(user.verification?.documentUrl))
      .map((user) => ({
        userId: user._id,
        name: user.name,
        email: user.email,
        verificationStatus: user.verification?.status || 'unverified',
        documentUrl: user.verification?.documentUrl || null,
        reviewedBy: user.verification?.reviewedBy || null,
        reviewedAt: user.verification?.reviewedAt || null,
      }));

    return res.json({
      success: true,
      total: docs.length,
      data: docs,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Ban a user ─────────────────────────────────────────
export const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await findUserById(Number(userId));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin' });
    }

    await updateUser(user._id, { isBanned: true });
    await resolveReportsByUser(user._id);

    return res.json({
      success: true,
      message: `User ${user.name} has been banned`,
    });
  } catch (error) {
    next(error);
  }
};
