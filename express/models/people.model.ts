import mongoose, { Schema, Document } from "mongoose";
import { Gender, Item, Job, Race } from "../enums/enum";
import { ICity } from "./city.model";

export interface IPeople extends Document {
  _id?: string;
  name: string;
  city: ICity["_id"];
  age: number;
  gender: Gender;
  job: Job;
  jobsExperience: Record<Job, number>;
  items: Record<Item, number>;
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
  age: { type: Number, required: true, default: 0, min: 0, max: 200 },
  gender: { type: String, enum: Object.values(Gender), required: true },
  job: { type: String, enum: Object.values(Job), required: true },
  jobsExperience: { type: Schema.Types.Mixed, required: true, default: {} },
  items: { type: Schema.Types.Mixed, required: true, default: {} },
  race: { type: String, enum: Object.values(Race), required: true },
  level: { type: Number, required: true, default: 1, min: 1, max: 200 },
  experience: { type: Number, required: true, default: 0 },
  health: { type: Number, required: true, default: 1, min: 1, max: 200 },
  strong: { type: Number, required: true, default: 1, min: 1, max: 200 },
  inteligence: { type: Number, required: true, default: 1, min: 1, max: 200 },
  endurence: { type: Number, required: true, default: 1, min: 1, max: 200 },
  dexterity: { type: Number, required: true, default: 1, min: 1, max: 200 },
});

export default mongoose.model<IPeople>("People", PeopleSchema);
