import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type Model,
  type Types,
} from "mongoose";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    passwordHash: { type: String, required: false },
    image: { type: String, maxlength: 512 },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    analysesToday: { type: Number, default: 0 },
    analysesDayKey: { type: String, default: "" },
    onboardingDone: { type: Boolean, default: false },
    googleAccessToken: { type: String },
    googleRefreshToken: { type: String },
    googleTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
);

type UserDoc = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export const UserModel =
  (models.User as Model<UserDoc> | undefined) ?? model<UserDoc>("User", userSchema);
