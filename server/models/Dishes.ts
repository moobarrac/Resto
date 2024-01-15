import mongoose, { Document, Schema } from "mongoose";

interface Dishes extends Document {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  ingredients: string[];
}

const DishesSchema: Schema<Dishes> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: {
        values: [
          "Hot Dishes",
          "Cold Dishes",
          "Soup",
          "Grill",
          "Dessert",
          "Drinks",
        ],
        message: "{VALUE} is not supported",
      },
    },
    quantity: {
      type: Number,
      default: 20,
    },
    ingredients: [
      {
        type: String,
        required: false,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Dishes", DishesSchema);
