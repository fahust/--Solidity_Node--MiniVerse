import mongoose, { Schema, Document } from "mongoose";
import { IPeople } from "./people.model";

export interface ICity extends Document {
  name: string;
  peoples: [IPeople["_id"]];
}

const CitySchema: Schema = new Schema({
  name: { type: String, required: true },
  peoples: { type: [Schema.Types.ObjectId], required: true },
});

export default mongoose.model<ICity>("City", CitySchema);
