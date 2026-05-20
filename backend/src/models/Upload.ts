import { Schema, model, Document, Types } from 'mongoose';

export interface IUpload extends Document {
  fileName: string;
  uploadedBy: Types.ObjectId;
  sourceType: 'GMB' | 'EXCEL' | 'CSV' | 'NUMBERS' | 'MANUAL';
  totalRows: number;
  importedRows: number;
  incompleteRows: number;
  duplicateRows: number;
  fieldMappings: Record<string, string>;
  createdAt: Date;
}

const uploadSchema = new Schema<IUpload>({
  fileName: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sourceType: { type: String, enum: ['GMB', 'EXCEL', 'CSV', 'NUMBERS', 'MANUAL'], default: 'EXCEL' },
  totalRows: { type: Number, default: 0 },
  importedRows: { type: Number, default: 0 },
  incompleteRows: { type: Number, default: 0 },
  duplicateRows: { type: Number, default: 0 },
  fieldMappings: { type: Schema.Types.Mixed, default: {} }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const Upload = model<IUpload>('Upload', uploadSchema);
export default Upload;
