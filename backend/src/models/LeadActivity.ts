import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType = 'CALL' | 'WHATSAPP' | 'NOTE' | 'FOLLOW_UP' | 'STATUS_CHANGE';

export type CallStatus =
  | 'CALL_NOT_PICKED'
  | 'BUSY'
  | 'SWITCHED_OFF'
  | 'WRONG_NUMBER'
  | 'CONTACTED'
  | 'CALL_BACK_LATER'
  | 'INTERESTED'
  | 'NOT_INTERESTED';

export interface ILeadActivity extends Document {
  leadId: Types.ObjectId;
  userId: Types.ObjectId;
  activityType: ActivityType;
  callStatus?: CallStatus;
  leadStatus?: string;
  remark?: string;
  nextFollowUpAt?: Date;
  interestedServices?: string[];
  createdAt: Date;
}

const leadActivitySchema = new Schema<ILeadActivity>({
  leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    enum: ['CALL', 'WHATSAPP', 'NOTE', 'FOLLOW_UP', 'STATUS_CHANGE'],
    required: true
  },
  callStatus: {
    type: String,
    enum: [
      'CALL_NOT_PICKED',
      'BUSY',
      'SWITCHED_OFF',
      'WRONG_NUMBER',
      'CONTACTED',
      'CALL_BACK_LATER',
      'INTERESTED',
      'NOT_INTERESTED'
    ]
  },
  leadStatus: { type: String },
  remark: { type: String, trim: true },
  nextFollowUpAt: { type: Date },
  interestedServices: { type: [String], default: [] }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

leadActivitySchema.index({ leadId: 1 });
leadActivitySchema.index({ userId: 1 });

export const LeadActivity = model<ILeadActivity>('LeadActivity', leadActivitySchema);
export default LeadActivity;
