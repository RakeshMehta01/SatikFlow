import { Response } from 'express';
import { Types } from 'mongoose';
import Lead, { ILead, LeadStatus } from '../models/Lead';
import User from '../models/User';
import LeadActivity from '../models/LeadActivity';
import { AuthRequest } from '../middlewares/auth';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, agentId, city, category, source, incomplete, followUpDate } = req.query;
    
    const query: any = {};

    // 1. Enforce agent visibility constraint
    if (req.user?.role === 'AGENT') {
      query.assignedTo = req.user._id;
    } else if (req.user?.role === 'MANAGER' && agentId) {
      query.assignedTo = new Types.ObjectId(agentId as string);
    }

    // 2. Status filter
    if (status) {
      query.status = status;
    }

    // 3. Incomplete leads filter
    if (incomplete === 'true') {
      query.status = 'INCOMPLETE';
    }

    // 4. City, Category, Source filters
    if (city) {
      query.city = new RegExp(city as string, 'i');
    }
    if (category) {
      query.gmbCategory = new RegExp(category as string, 'i');
    }
    if (source) {
      query.source = source;
    }

    // 5. Text Search (BusinessName, CustomerName, Mobile, Category, City)
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { displayName: searchRegex },
        { businessName: searchRegex },
        { customerName: searchRegex },
        { mobile: searchRegex },
        { city: searchRegex },
        { gmbCategory: searchRegex }
      ];
    }

    // 6. Follow-up date filter (today, overdue, upcoming)
    if (followUpDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (followUpDate === 'today') {
        query.nextFollowUpAt = {
          $gte: today,
          $lt: tomorrow
        };
      } else if (followUpDate === 'overdue') {
        query.nextFollowUpAt = {
          $lt: today
        };
        // Overdue must also have follow_up or active status where follow-up is expected
        query.status = 'FOLLOW_UP';
      } else if (followUpDate === 'upcoming') {
        query.nextFollowUpAt = {
          $gte: tomorrow
        };
      }
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email phone')
      .populate('uploadedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    console.error('getLeads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getLeadById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('assignedTo', 'name email phone')
      .populate('uploadedBy', 'name email');

    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    // Security check: Agent can only view their own leads
    if (req.user?.role === 'AGENT' && (!lead.assignedTo || lead.assignedTo._id.toString() !== req.user._id.toString())) {
      res.status(403).json({ message: 'Access denied: This lead is not assigned to you' });
      return;
    }

    res.status(200).json(lead);
  } catch (error) {
    console.error('getLeadById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leadData = req.body;
    
    // Auto calculate display name
    const display = leadData.customerName || leadData.businessName || leadData.mobile || 'Unnamed Lead';
    
    // If mobile is missing, status is INCOMPLETE
    let status: LeadStatus = 'NEW';
    if (!leadData.mobile) {
      status = 'INCOMPLETE';
    }

    const lead = await Lead.create({
      ...leadData,
      displayName: display,
      status: leadData.status || status,
      uploadedBy: req.user?._id
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error('createLead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    // Security: Agent can only edit assigned leads
    if (req.user?.role === 'AGENT' && (!lead.assignedTo || lead.assignedTo.toString() !== req.user._id.toString())) {
      res.status(403).json({ message: 'Access denied: This lead is not assigned to you' });
      return;
    }

    // Update fields
    const fieldsToUpdate = [
      'businessName', 'customerName', 'mobile', 'alternatePhone', 'whatsappNumber',
      'email', 'website', 'googleMapsUrl', 'gmbCategory', 'rating', 'reviewCount',
      'address', 'city', 'state', 'pincode', 'requirement', 'remarks', 'status', 'nextFollowUpAt'
    ];

    fieldsToUpdate.forEach(field => {
      if (updateData[field] !== undefined) {
        (lead as any)[field] = updateData[field];
      }
    });

    // Update customFields if provided
    if (updateData.customFields) {
      lead.customFields = { ...lead.customFields, ...updateData.customFields };
    }

    // Recalculate display name if name changed
    lead.displayName = lead.customerName || lead.businessName || lead.mobile || lead.displayName;

    // Check if it was INCOMPLETE but now has phone and display name
    if (lead.status === 'INCOMPLETE' && lead.mobile) {
      lead.status = 'NEW';
    }

    await lead.save();

    // Populate and return
    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email phone')
      .populate('uploadedBy', 'name email');

    res.status(200).json(updatedLead);
  } catch (error) {
    console.error('updateLead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      res.status(404).json({ message: 'Lead not found' });
      return;
    }

    if (agentId) {
      const agent = await User.findById(agentId);
      if (!agent || agent.role !== 'AGENT') {
        res.status(400).json({ message: 'Invalid agent ID' });
        return;
      }
      lead.assignedTo = agent._id as Types.ObjectId;
    } else {
      // Unassign lead
      lead.assignedTo = undefined;
    }

    await lead.save();

    res.status(200).json({
      message: 'Lead assignment updated',
      leadId: lead._id,
      assignedTo: lead.assignedTo
    });
  } catch (error) {
    console.error('assignLead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const bulkAssignLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadIds, agentId } = req.body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      res.status(400).json({ message: 'Please provide an array of leadIds' });
      return;
    }

    let updateQuery: any = {};
    let assignedAgentId: Types.ObjectId | null = null;

    if (agentId) {
      const agent = await User.findById(agentId);
      if (!agent || agent.role !== 'AGENT') {
        res.status(400).json({ message: 'Invalid agent ID' });
        return;
      }
      assignedAgentId = agent._id as Types.ObjectId;
      updateQuery = { $set: { assignedTo: assignedAgentId } };
    } else {
      updateQuery = { $unset: { assignedTo: "" } };
    }

    await Lead.updateMany(
      { _id: { $in: leadIds } },
      updateQuery
    );

    res.status(200).json({
      message: `Successfully updated assignment for ${leadIds.length} leads`,
      assignedTo: assignedAgentId
    });
  } catch (error) {
    console.error('bulkAssignLeads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'AGENT') {
      res.status(403).json({ message: 'Only calling agents can access this route' });
      return;
    }

    const leads = await Lead.find({ assignedTo: req.user._id })
      .populate('uploadedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    console.error('getMyLeads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
