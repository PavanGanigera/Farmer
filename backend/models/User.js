import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  primaryCrop: { type: String, required: true },
  landAcres: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
