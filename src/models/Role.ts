import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[]; // e.g. ["read:users", "write:reports"]
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);

export default Role;
