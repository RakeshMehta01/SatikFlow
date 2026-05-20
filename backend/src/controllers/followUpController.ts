import { Response } from 'express';
import { Types } from 'mongoose';
import Lead from '../models/Lead';
import { AuthRequest } from '../middlewares/auth';

export const getFollowUps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agentId, filter } = req.query; // filter: 'today' | 'overdue' | 'upcoming' | 'all'
    const query: any = { nextFollowUpAt: { $exists: true, $ne: null } };

    if (req.user?.role === 'AGENT') {
      // Force current agent
      query.assignedTo = req.user._id;
    } else if (req.user?.role === 'MANAGER' && agentId) {
      query.assignedTo = new Types.ObjectId(agentId as string);
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    if (filter === 'today') {
      query.nextFollowUpAt = { $gte: todayStart, $lte: todayEnd };
    } else if (filter === 'overdue') {
      query.nextFollowUpAt = { $lt: todayStart };
      // Overdue follow ups are typically those that are still in calling/follow up status
      query.status = { $in: ['FOLLOW_UP', 'NEW', 'NOT_PICKED', 'BUSY', 'CONTACTED'] };
    } else if (filter === 'upcoming') {
      query.nextFollowUpAt = { $gt: todayEnd };
    }

    const followUps = await Lead.find(query)
      .populate('assignedTo', 'name email phone')
      .sort({ nextFollowUpAt: 1 }); // Soonest first

    res.status(200).json(followUps);
  } catch (error) {
    console.error('getFollowUps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyFollowUps = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'AGENT') {
      res.status(403).json({ message: 'Only calling agents can access this route' });
      return;
    }

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const baseQuery = {
      assignedTo: req.user._id,
      nextFollowUpAt: { $exists: true, $ne: null }
    };

    // Query each segment separately and return structured response
    const today = await Lead.find({
      ...baseQuery,
      nextFollowUpAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ nextFollowUpAt: 1 });

    const overdue = await Lead.find({
      ...baseQuery,
      nextFollowUpAt: { $lt: todayStart },
      status: { $in: ['FOLLOW_UP', 'NEW', 'NOT_PICKED', 'BUSY', 'CONTACTED'] }
    }).sort({ nextFollowUpAt: 1 });

    const upcoming = await Lead.find({
      ...baseQuery,
      nextFollowUpAt: { $gt: todayEnd }
    }).sort({ nextFollowUpAt: 1 });

    res.status(200).json({
      today,
      overdue,
      upcoming
    });
  } catch (error) {
    console.error('getMyFollowUps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
