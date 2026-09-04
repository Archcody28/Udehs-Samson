import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    issuer: { type: String, default: '' },
    year: { type: String, default: '' },
    url: { type: String, default: '' },
  },
  { _id: true }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    year: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

const philosophyItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: true }
);

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
    linkedin: { type: String, default: '' },
    x: { type: String, default: '' },
    whatsapp: { type: String, required: true },
    facebook: { type: String, default: '' },
    avatar: { type: String, default: '' },
    cvUrl: { type: String, default: '' },
    achievements: { type: [achievementSchema], default: [] },
    philosophy: { type: [philosophyItemSchema], default: [] },
    yearsOfExperience: { type: Number, default: 0 },
    clientSatisfaction: { type: Number, default: 0 },
    projectsDelivered: { type: Number, default: 0 },
    happyClients: { type: Number, default: 0 },
    education: { type: [educationSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
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