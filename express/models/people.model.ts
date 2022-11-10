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
  level: number;
  experience: number;
  health: number;
  strong: number;
  inteligence: number;
  endurence: number;
  dexterity: number;
}

const PeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, required: true, ref: "City" },
  age: { type: Number, required: true, default: 0 },
  gender: { type: String, enum: Object.values(Gender), required: true },
  race: { type: String, enum: Object.values(Race), required: true },
  level: { type: Number, required: true, default: 1 },
  experience: { type: Number, required: true, default: 0 },
  health: { type: Number, required: true, default: 1 },
  strong: { type: Number, required: true, default: 1 },
  inteligence: { type: Number, required: true, default: 1 },
  endurence: { type: Number, required: true, default: 1 },
  dexterity: { type: Number, required: true, default: 1 },
});

export default mongoose.model<IPeople>("People", PeopleSchema);
