import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock_status: {
      type: String,
      required: true,
      enum: ["instock", "outofstock", "onbackorder"],
    },
    stock_quantity: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: String,
      },
    ],
    on_sale: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Product", ProductSchema);
