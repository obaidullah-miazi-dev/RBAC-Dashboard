import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserPermission extends Document {
  userId: mongoose.Types.ObjectId;
  grantedPermissions: string[];
  revokedPermissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserPermissionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    grantedPermissions: [
      {
        type: String,
      },
    ],
    revokedPermissions: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserPermission: Model<IUserPermission> =
  mongoose.models.UserPermission || mongoose.model<IUserPermission>('UserPermission', UserPermissionSchema);

export default UserPermission;
