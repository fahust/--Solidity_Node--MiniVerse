import Pet, { IPet } from "../models/city.model";
import { IUser } from "../models/user.model";

interface ICreatePetInput {
  owner: IUser["_id"];
  name: IPet["name"];
}

async function CreatePet({ owner, name }: ICreatePetInput): Promise<IPet> {
  return Pet.create({
    owner,
    name,
  });
}

export default {
  CreatePet,
};
