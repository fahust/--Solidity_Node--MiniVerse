import User, { IUser } from "../models/user.model";

async function createUser({
  email,
  firstName,
  lastName,
  gender,
  address,
}: IUser): Promise<IUser> {
  return User.create({
    email,
    gender,
    firstName,
    lastName,
    address,
  });
}

export default {
  createUser,
};
