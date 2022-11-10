import mongoose, { Schema, Document } from "mongoose";
import { Building, Item } from "../enums/enum";

export interface ICity extends Document {
  name: string;
  items: Record<Item, number>;
  buildings: Record<Item, number>;
  percentBuild: number;
  houseInBuilding: Building;
}

const CitySchema: Schema = new Schema({
  name: { type: String, required: true },
  items: { type: Schema.Types.Mixed, required: true, default: {} },
  buildings: { type: Schema.Types.Mixed, required: true, default: {} },
  percentBuild: { type: Number, required: true, min: 0, default: 0 },
  houseInBuilding: {
    type: String,
    enum: Object.values(Building),
    required: true,
  },
});

export default mongoose.model<ICity>("City", CitySchema);
