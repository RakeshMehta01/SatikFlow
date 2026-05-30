import { Response } from 'express';
import { Types } from 'mongoose';
import Lead, { ILead, LeadStatus } from '../models/Lead';
import User from '../models/User';
import LeadActivity from '../models/LeadActivity';
import { AuthRequest } from '../middlewares/auth';

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, agentId, city, category, source, incomplete, followUpDate, interestedService } = req.query;
    
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

    if (interestedService) {
      query.interestedServices = interestedService;
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
      'address', 'city', 'state', 'pincode', 'requirement', 'remarks', 'status', 'nextFollowUpAt', 'interestedServices'
    ];

    const changes: string[] = [];
    const fieldLabels: Record<string, string> = {
      businessName: 'Business Name',
      customerName: 'Customer Name',
      mobile: 'Mobile/Phone',
      alternatePhone: 'Alternate Phone',
      whatsappNumber: 'WhatsApp Number',
      email: 'Email Address',
      website: 'Website URL',
      googleMapsUrl: 'Google Maps URL',
      gmbCategory: 'Category',
      rating: 'Rating',
      reviewCount: 'Review Count',
      address: 'Full Address',
      city: 'City',
      state: 'State',
      pincode: 'Pincode',
      requirement: 'Requirement Details',
      remarks: 'Remarks',
      status: 'Status',
      nextFollowUpAt: 'Follow Up Date'
    };

    fieldsToUpdate.forEach(field => {
      if (updateData[field] !== undefined) {
        const oldVal = (lead as any)[field];
        const newVal = updateData[field];
        
        if (field === 'interestedServices') {
          const oldArr = Array.isArray(oldVal) ? oldVal : [];
          const newArr = Array.isArray(newVal) ? newVal : [];
          const equal = oldArr.length === newArr.length && oldArr.every(x => newArr.includes(x));
          if (!equal) {
            changes.push(`Services Interested updated to: ${newArr.join(', ') || 'None'}`);
            (lead as any)[field] = newArr;
          }
        } else {
          const oldStr = oldVal ? String(oldVal).trim() : '';
          const newStr = newVal ? String(newVal).trim() : '';
          
          if (oldStr !== newStr) {
            const label = fieldLabels[field] || field;
            if (!oldStr && newStr) {
              changes.push(`${label} is added`);
            } else if (oldStr && !newStr) {
              changes.push(`${label} is removed`);
            } else {
              changes.push(`${label} is updated`);
            }
            (lead as any)[field] = newVal;
          }
        }
      }
    });

    // Update customFields if provided safely without spreading Mongoose Map internal properties
    if (updateData.customFields) {
      const plainCustom = lead.customFields && typeof (lead.customFields as any).toJSON === 'function'
        ? (lead.customFields as any).toJSON()
        : (lead.customFields instanceof Map ? Object.fromEntries(lead.customFields) : (lead.customFields || {}));
      
      Object.entries(updateData.customFields).forEach(([k, v]) => {
        const oldVal = plainCustom[k];
        const newVal = v;
        const oldStr = oldVal ? String(oldVal).trim() : '';
        const newStr = newVal ? String(newVal).trim() : '';
        if (oldStr !== newStr) {
          if (!oldStr && newStr) {
            changes.push(`Custom field "${k}" is added`);
          } else if (oldStr && !newStr) {
            changes.push(`Custom field "${k}" is removed`);
          } else {
            changes.push(`Custom field "${k}" is updated`);
          }
        }
      });
      
      lead.customFields = { ...plainCustom, ...updateData.customFields };
    }

    // Recalculate display name if name changed
    lead.displayName = lead.customerName || lead.businessName || lead.mobile || lead.displayName;

    // Check if it was INCOMPLETE but now has phone and display name
    if (lead.status === 'INCOMPLETE' && lead.mobile) {
      lead.status = 'NEW';
    }

    await lead.save();

    // Log update activity if any changes were made
    if (changes.length > 0) {
      await LeadActivity.create({
        leadId: lead._id,
        userId: req.user?._id,
        activityType: 'NOTE',
        remark: `Lead details updated: ${changes.join(', ')}`
      });
    }

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

    // Only return leads that genuinely still need to be called.
    // Statuses that mean "done / actioned" are excluded:
    //   CONTACTED, INTERESTED, CONVERTED, NOT_INTERESTED, INVALID_NUMBER
    //   FOLLOW_UP leads are handled by the Follow-Ups page (scheduled callbacks)
    const pendingStatuses: LeadStatus[] = ['NEW', 'INCOMPLETE', 'NOT_PICKED', 'BUSY'];

    const leads = await Lead.find({
      assignedTo: req.user._id,
      status: { $in: pendingStatuses }
    })
      .populate('uploadedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json(leads);
  } catch (error) {
    console.error('getMyLeads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

