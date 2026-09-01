import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    bio: { type: String, required: true },
    shortBio: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    location: { type: String, required: true },
    website: { type: String, required: true },
    github: { type: String, required: true },
    linkedin: { type: String, required: true },
    x: { type: String, required: true },
    whatsapp: { type: String, required: true },
    avatar: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model('Profile', profileSchema);