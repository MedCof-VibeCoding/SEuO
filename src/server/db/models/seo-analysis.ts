import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const seoAnalysisSchema = new Schema(
  {
    analysisId: { type: String, required: true, unique: true, index: true },
    shareSlug: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    primaryDomain: { type: String, required: true },
    report: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

type SeoAnalysisDoc = InferSchemaType<typeof seoAnalysisSchema> & {
  _id: Types.ObjectId;
};

export const SeoAnalysisModel =
  (models.SeoAnalysis as Model<SeoAnalysisDoc> | undefined) ??
  model<SeoAnalysisDoc>("SeoAnalysis", seoAnalysisSchema);
