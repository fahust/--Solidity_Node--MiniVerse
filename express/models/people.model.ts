import mongoose, { Schema, Document } from "mongoose";
import { Gender } from "../enums/enum";
import { ICity } from "./city.model";

export interface IPeople extends Document {
  _id?: string;
  name: string;
  city?: ICity["_id"];
  age: number;
  gender: Gender;
}

const PeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, required: false },
  age: { type: Number, required: true, default: 0 },
  gender: { type: String, enum: Object.values(Gender), required: true },
});

export default mongoose.model<IPeople>("People", PeopleSchema);
