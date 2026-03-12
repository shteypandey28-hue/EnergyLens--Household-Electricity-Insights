import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    authProvider: 'local' | 'google';
    avatar?: string;
    profilePicture?: string;
    phone?: string;
    state?: string;
    tariffType?: string;
    role: 'free' | 'basic' | 'premium' | 'admin';
    isEmailVerified: boolean;
    emailVerifyToken?: string;
    emailVerifyExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    activeHousehold?: mongoose.Types.ObjectId;
    monthlyBudget?: number;
    notificationPreferences: {
        email: boolean;
        budgetAlert: boolean;
        peakHourAlert: boolean;
        anomalyAlert: boolean;
        weeklyReport: boolean;
    };
    subscriptionExpires?: Date;
    autoRenew: boolean;
    createdAt: Date;
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: { type: String },
    profilePicture: { type: String },
    phone: { type: String },
    state: { type: String, default: 'Delhi' },
    tariffType: { type: String, default: 'Residential' },
    role: { type: String, enum: ['free', 'basic', 'premium', 'admin'], default: 'free' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifyToken: { type: String },
    emailVerifyExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    activeHousehold: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    monthlyBudget: { type: Number, default: 2000 },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        budgetAlert: { type: Boolean, default: true },
        peakHourAlert: { type: Boolean, default: true },
        anomalyAlert: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false },
    },
    subscriptionExpires: { type: Date },
    autoRenew: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
