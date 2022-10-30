import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";

export interface IPeople extends Document {
  name: string;
  owner: IUser["_id"];
}

const PeopleSchema: Schema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, required: true },
});

export default mongoose.model<IPeople>("People", PeopleSchema);
