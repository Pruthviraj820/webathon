import { findUserById, findUsers, updateUser } from '../models/User.js';
import { findMatchResultsWithUser } from '../models/MatchResult.js';
import { calculateMatchScore } from '../utils/matchingAlgorithm.js';

/**
 * Recommendation Controller — top matches & daily suggestions.
 */

const normalizeIdList = (ids = []) =>
  ids
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

// ─── Top Matches ────────────────────────────────────────
export const getTopRecommendations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const currentUserId = Number(currentUser?._id ?? currentUser?.id);
    const limit = parseInt(req.query.limit) || 10;
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
      return res.status(401).json({ success: false, message: 'Invalid user session' });
    }

    // Try cache first
    const cached = await findMatchResultsWithUser(currentUserId, { limit });
    if (cached.length >= limit) {
      return res.json({
        success: true, source: 'cache', count: cached.length,
        data: cached.map((m) => ({
          user: m.matchedUser, score: m.score,
          breakdown: m.breakdown, explanation: m.explanation,
        })),
      });
    }

    // Cache miss — compute fresh
    const targetGender = currentUser.gender === 'male' ? 'female' : 'male';
    const candidates = await findUsers(
      {
        gender: targetGender, isBanned: false,
        excludeIds: [currentUserId, ...normalizeIdList(currentUser.blockedUsers)],
      },
      { limit: 100 }
    );

    const scored = candidates
      .map((c) => ({ candidate: c, ...calculateMatchScore(currentUser, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.json({
      success: true, source: 'computed', count: scored.length,
      data: scored.map((m) => ({
        user: m.candidate, score: m.score,
        breakdown: m.breakdown, explanation: m.explanation,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Daily Suggestions (no repeats) ─────────────────────
export const getDailySuggestions = async (req, res, next) => {
  try {
    // Use req.user from middleware as starting point (always available)
    let currentUser = req.user;
    const currentUserId = Number(currentUser?._id ?? currentUser?.id);
    const limit = parseInt(req.query.limit) || 5;
    const today = new Date().toDateString();

    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
      return res.status(401).json({ success: false, message: 'Invalid user session' });
    }

    // Reset shown list if the date has changed
    let dailySuggestionsShown = currentUser.dailySuggestionsShown || [];
    if (
      !currentUser.dailySuggestionsDate ||
      new Date(currentUser.dailySuggestionsDate).toDateString() !== today
    ) {
      dailySuggestionsShown = [];
      await updateUser(currentUserId, {
        dailySuggestionsShown: [],
        dailySuggestionsDate: new Date().toISOString(),
      });
      // Re-fetch the updated user
      const refreshed = await findUserById(currentUserId);
      if (refreshed) currentUser = refreshed;
    }

    const targetGender = currentUser.gender === 'male' ? 'female' : 'male';
    const excludeIds = [
      currentUserId,
      ...normalizeIdList(currentUser.blockedUsers),
      ...normalizeIdList(dailySuggestionsShown),
    ];
    const candidates = await findUsers(
      { gender: targetGender, isBanned: false, excludeIds },
      { limit: 50 }
    );

    const scored = candidates
      .map((c) => ({ candidate: c, ...calculateMatchScore(currentUser, c) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Record shown users
    const shownIds = scored.map((m) => m.candidate._id);
    const updatedShown = [...dailySuggestionsShown, ...shownIds];
    await updateUser(currentUserId, { dailySuggestionsShown: normalizeIdList(updatedShown) });

    return res.json({
      success: true, count: scored.length,
      data: scored.map((m) => ({
        user: m.candidate, score: m.score,
        breakdown: m.breakdown, explanation: m.explanation,
      })),
    });
  } catch (error) {
    next(error);
  }
};
