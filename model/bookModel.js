import mongoose from "mongoose";

const bookSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    author: {
      type: String,
      require: true,
    },
    publishYear: {
      type: Number,
      require: true,
    },
    image: {
      type: String,
      require: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Correctly placed as the second argument to Schema
  }
);

export const Book = mongoose.model("book", bookSchema);
