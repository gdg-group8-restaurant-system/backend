import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
  },
  { timestamps: true },
);

favoriteSchema.index({ userId: 1, menuItemId: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);
