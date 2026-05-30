import { Response } from 'express';
import LeadActivity from '../models/LeadActivity';
import Lead from '../models/Lead';
import { AuthRequest } from '../middlewares/auth';

export const createActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId, activityType, status, callStatus, leadStatus, remark, nextFollowUpAt, interestedServices } = req.body;

    // Resolve whichever status field was sent
    const resolvedStatus = status || leadStatus;

    if (!leadId || !activityType) {
      res.status(400).json({ message: 'Lead ID and Activity Type are required' });
      return;
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    // Security: Agent can only log activities for assigned leads
    if (req.user?.role === 'AGENT' && (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
      res.status(403).json({ message: 'Access denied: Lead is not assigned to you' });
      return;
    }

    const activity = await LeadActivity.create({
      leadId,
      userId: req.user?._id,
      activityType,
      callStatus,
      leadStatus: resolvedStatus,
      remark,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : undefined,
      interestedServices
    });

    if (resolvedStatus) {
      lead.status = resolvedStatus;
    }
    if (nextFollowUpAt !== undefined) {
      lead.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : undefined;
    }
    if (interestedServices !== undefined) {
      lead.interestedServices = interestedServices;
    }
    lead.lastActivityAt = new Date();
    await lead.save();

    res.status(201).json(activity);
  } catch (error) {
    console.error('createActivity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getActivitiesByLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    // Security: Agent can only view their own lead activities
    if (req.user?.role === 'AGENT' && (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const activities = await LeadActivity.find({ leadId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (error) {
    console.error('getActivitiesByLead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
