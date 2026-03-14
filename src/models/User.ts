import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: string; // the name of the role template
  permissions: string[]; // actual explicit active atoms for this user
  isActive: boolean;
  refreshTokens: string[]; // allow multiple devices
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String, // references Role name
      required: true,
    },
    permissions: [
      {
        type: String, // Individual atom e.g., 'read:users'
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// We won't use .populate for role because the architecture says roles are just baseline templates.
// The true source of authority is the `permissions` array, which contains the atoms.

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
