import mongoose, { Schema, Document } from "mongoose";
import { Item } from "../enums/enum";

export interface ICity extends Document {
  name: string;
  items: Record<Item, number>;
}

const CitySchema: Schema = new Schema({
  name: { type: String, required: true },
  items: { type: Schema.Types.Mixed, required: true, default: {} },
});

export default mongoose.model<ICity>("City", CitySchema);
