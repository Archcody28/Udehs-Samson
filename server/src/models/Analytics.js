import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    pageViews: {
      type: [{ date: String, views: Number }],
      default: [],
    },
    projectViews: {
      type: [{ projectId: String, views: Number }],
      default: [],
    },
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

export default mongoose.model('Analytics', analyticsSchema);