import { Schema, model, Document, Types } from 'mongoose';

export type LeadStatus =
  | 'NEW'
  | 'INCOMPLETE'
  | 'NOT_PICKED'
  | 'BUSY'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'CONVERTED'
  | 'NOT_INTERESTED'
  | 'INVALID_NUMBER';

export interface ILead extends Document {
  displayName: string;
  businessName?: string;
  customerName?: string;
  mobile?: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  gmbCategory?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  source?: string;
  requirement?: string;
  remarks?: string;
  status: LeadStatus;
  assignedTo?: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  customFields?: Map<string, any>;
  lastActivityAt?: Date;
  nextFollowUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>({
  displayName: { type: String, required: true },
  businessName: { type: String, trim: true },
  customerName: { type: String, trim: true },
  mobile: { type: String, trim: true },
  alternatePhone: { type: String, trim: true },
  whatsappNumber: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  googleMapsUrl: { type: String, trim: true },
  gmbCategory: { type: String, trim: true },
  rating: { type: Number },
  reviewCount: { type: Number },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pincode: { type: String, trim: true },
  source: { type: String, trim: true, default: 'MANUAL' },
  requirement: { type: String, trim: true },
  remarks: { type: String, trim: true },
  status: {
    type: String,
    enum: [
      'NEW',
      'INCOMPLETE',
      'NOT_PICKED',
      'BUSY',
      'CONTACTED',
      'FOLLOW_UP',
      'INTERESTED',
      'CONVERTED',
      'NOT_INTERESTED',
      'INVALID_NUMBER'
    ],
    default: 'NEW'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  customFields: { type: Map, of: Schema.Types.Mixed, default: {} },
  lastActivityAt: { type: Date },
  nextFollowUpAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for fast searching and duplication checks
leadSchema.index({ mobile: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ displayName: 'text', businessName: 'text', customerName: 'text', city: 'text', gmbCategory: 'text' });

export const Lead = model<ILead>('Lead', leadSchema);
export default Lead;
