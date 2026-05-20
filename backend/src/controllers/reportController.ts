import { Response } from 'express';
import Lead from '../models/Lead';
import User from '../models/User';
import LeadActivity from '../models/LeadActivity';
import { AuthRequest } from '../middlewares/auth';

export const getManagerReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // 1. Total leads by status
    const statusCounts = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const leadsByStatus = statusCounts.reduce((acc: Record<string, number>, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Ensure all statuses have a default value
    const allStatuses = [
      'NEW', 'INCOMPLETE', 'NOT_PICKED', 'BUSY', 'CONTACTED',
      'FOLLOW_UP', 'INTERESTED', 'CONVERTED', 'NOT_INTERESTED', 'INVALID_NUMBER'
    ];
    allStatuses.forEach(status => {
      if (leadsByStatus[status] === undefined) {
        leadsByStatus[status] = 0;
      }
    });

    // 2. Pending & Missed Follow-ups
    const pendingFollowUps = await Lead.countDocuments({
      nextFollowUpAt: { $gt: now }
    });

    const missedFollowUps = await Lead.countDocuments({
      nextFollowUpAt: { $lte: now },
      status: { $in: ['FOLLOW_UP', 'NEW', 'NOT_PICKED', 'BUSY', 'CONTACTED'] }
    });

    const incompleteLeadsCount = leadsByStatus['INCOMPLETE'] || 0;

    // 3. Agent performance breakdown
    const agents = await User.find({ role: 'AGENT' });
    const agentBreakdown = await Promise.all(
      agents.map(async (agent) => {
        const totalCalls = await LeadActivity.countDocuments({
          userId: agent._id,
          activityType: 'CALL'
        });
        const interestedCount = await Lead.countDocuments({
          assignedTo: agent._id,
          status: 'INTERESTED'
        });
        const convertedCount = await Lead.countDocuments({
          assignedTo: agent._id,
          status: 'CONVERTED'
        });
        const incompleteAssigned = await Lead.countDocuments({
          assignedTo: agent._id,
          status: 'INCOMPLETE'
        });

        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          status: agent.status,
          callsDone: totalCalls,
          interestedCount,
          convertedCount,
          incompleteAssigned
        };
      })
    );

    res.status(200).json({
      leadsByStatus,
      pendingFollowUps,
      missedFollowUps,
      incompleteLeadsCount,
      agentBreakdown
    });
  } catch (error) {
    console.error('getManagerReports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAgentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'AGENT') {
      res.status(403).json({ message: 'Access denied: Agents only' });
      return;
    }

    const agentId = req.user._id;

    // 1. My calls done
    const totalCalls = await LeadActivity.countDocuments({
      userId: agentId,
      activityType: 'CALL'
    });

    // 2. My follow ups
    const totalFollowUps = await Lead.countDocuments({
      assignedTo: agentId,
      nextFollowUpAt: { $exists: true, $ne: null }
    });

    // 3. My interested leads
    const interestedCount = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'INTERESTED'
    });

    // 4. My converted leads
    const convertedCount = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'CONVERTED'
    });

    // 5. Incomplete leads assigned to me
    const incompleteAssigned = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'INCOMPLETE'
    });

    // 6. My leads by status
    const statusCounts = await Lead.aggregate([
      { $match: { assignedTo: agentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const leadsByStatus = statusCounts.reduce((acc: Record<string, number>, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const allStatuses = [
      'NEW', 'INCOMPLETE', 'NOT_PICKED', 'BUSY', 'CONTACTED',
      'FOLLOW_UP', 'INTERESTED', 'CONVERTED', 'NOT_INTERESTED', 'INVALID_NUMBER'
    ];
    allStatuses.forEach(status => {
      if (leadsByStatus[status] === undefined) {
        leadsByStatus[status] = 0;
      }
    });

    res.status(200).json({
      callsDone: totalCalls,
      followUps: totalFollowUps,
      interestedCount,
      convertedCount,
      incompleteAssigned,
      leadsByStatus
    });
  } catch (error) {
    console.error('getAgentReports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
