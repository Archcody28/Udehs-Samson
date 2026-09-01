import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    videoUrl: { type: String },
    technologies: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    githubUrl: { type: String },
    liveUrl: { type: String },
    featured: { type: Boolean, default: false },
    completionDate: { type: String, required: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    seoTitle: { type: String },
    seoDescription: { type: String },
    challenges: { type: String },
    solutions: { type: String },
    relatedProjectIds: { type: [String], default: [] },
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

export default mongoose.model('Project', projectSchema);