import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: string | mongoose.Types.ObjectId;
  targetUserId?: string | mongoose.Types.ObjectId;
  action: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  actorId: {
    type: Schema.Types.Mixed, // Can be ObjectId or string like 'SYSTEM'
    required: true,
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    // Note: Append-only ledger usually shouldn't be modifiable
  },
});

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
