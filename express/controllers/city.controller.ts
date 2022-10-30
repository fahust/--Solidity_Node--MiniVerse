import City, { ICity } from "../models/city.model";

async function create(city: ICity): Promise<ICity> {
  return City.create(city);
}

export default {
  create,
};
