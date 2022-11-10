import mongoose, { Schema, Document } from "mongoose";
import { Gender, Race } from "../enums/enum";
import { ICity } from "./city.model";

export interface IPeople extends Document {
  _id?: string;
  name: string;
  city: ICity["_id"];
  age: number;
  gender: Gender;
  race: Race;
}

const PeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, required: true, ref: "City" },
  age: { type: Number, required: true, default: 0 },
  gender: { type: String, enum: Object.values(Gender), required: true },
  race: { type: String, enum: Object.values(Race), required: true },
});

export default mongoose.model<IPeople>("People", PeopleSchema);
