import { Response } from 'express';
import Lead from '../models/Lead';
import User from '../models/User';
import LeadActivity from '../models/LeadActivity';
import { AuthRequest } from '../middlewares/auth';

export const getManagerDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Basic Counts
    const totalLeads = await Lead.countDocuments();
    const assignedLeads = await Lead.countDocuments({ assignedTo: { $exists: true, $ne: null } });
    const unassignedLeads = await Lead.countDocuments({ assignedTo: null });
    const incompleteLeads = await Lead.countDocuments({ status: 'INCOMPLETE' });
    const interestedLeads = await Lead.countDocuments({ status: 'INTERESTED' });
    const convertedLeads = await Lead.countDocuments({ status: 'CONVERTED' });

    // 2. Activities (calls done today)
    const callsDoneToday = await LeadActivity.countDocuments({
      activityType: 'CALL',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // 3. Follow-ups due today
    const followUpsDueToday = await Lead.countDocuments({
      nextFollowUpAt: { $gte: todayStart, $lte: todayEnd }
    });

    // 4. Agent-wise performance
    const agents = await User.find({ role: 'AGENT', status: 'ACTIVE' });
    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        const totalAssigned = await Lead.countDocuments({ assignedTo: agent._id });
        const callsCount = await LeadActivity.countDocuments({
          userId: agent._id,
          activityType: 'CALL',
          createdAt: { $gte: todayStart, $lte: todayEnd }
        });
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

        return {
          agentId: agent._id,
          name: agent.name,
          email: agent.email,
          totalAssigned,
          callsDoneToday: callsCount,
          totalCalls,
          interestedCount,
          convertedCount
        };
      })
    );

    res.status(200).json({
      totalLeads,
      assignedLeads,
      unassignedLeads,
      incompleteLeads,
      callsDoneToday,
      followUpsDueToday,
      interestedLeads,
      convertedLeads,
      agentPerformance
    });
  } catch (error) {
    console.error('getManagerDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAgentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'AGENT') {
      res.status(403).json({ message: 'Access denied: Agents only' });
      return;
    }

    const agentId = req.user._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. My Assigned Leads
    const myAssignedLeads = await Lead.countDocuments({ assignedTo: agentId });

    // 2. Incomplete Leads I need to update
    const incompleteLeads = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'INCOMPLETE'
    });

    // 3. Calls Pending (New, Not Picked, Busy, Follow Up status leads assigned to me)
    const callsPending = await Lead.countDocuments({
      assignedTo: agentId,
      status: { $in: ['NEW', 'NOT_PICKED', 'BUSY', 'FOLLOW_UP'] }
    });

    // 4. Calls Done Today by this agent
    const callsDoneToday = await LeadActivity.countDocuments({
      userId: agentId,
      activityType: 'CALL',
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    // 5. Follow-ups due today
    const followUpsDueToday = await Lead.countDocuments({
      assignedTo: agentId,
      nextFollowUpAt: { $gte: todayStart, $lte: todayEnd }
    });

    // 6. Interested
    const interestedLeads = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'INTERESTED'
    });

    // 7. Converted
    const convertedLeads = await Lead.countDocuments({
      assignedTo: agentId,
      status: 'CONVERTED'
    });

    res.status(200).json({
      myAssignedLeads,
      incompleteLeads,
      callsPending,
      callsDoneToday,
      followUpsDueToday,
      interestedLeads,
      convertedLeads
    });
  } catch (error) {
    console.error('getAgentDashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
