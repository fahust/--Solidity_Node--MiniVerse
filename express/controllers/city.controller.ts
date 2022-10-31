import { randomEnum } from "../helper/utils.helper";
import { housing } from "../constant/housing.constant";
import City, { ICity } from "../models/city.model";
import { Building } from "../enums/enum";

async function create(city: ICity): Promise<ICity> {
  return City.create(city);
}

async function build(idCity: string) {
  const city = await City.findByIdAndUpdate(
    idCity,
    {
      $inc: { percentBuild: 1 },
    },
    { new: true }
  );

  if (city?.percentBuild! >= housing[city?.houseInBuilding!].maxPercentBuild)
    return increaseBuilding(city!);
  return city;
}

async function increaseBuilding(city: ICity) {
  const newBuilding = "buildings." + city.houseInBuilding;
  return City.findByIdAndUpdate(
    city._id,
    {
      $set: { percentBuild: 0, houseInBuilding: randomEnum(Building) },
      $inc: { [newBuilding]: 1 },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

async function find(options: any, skip = 0, limit = 0): Promise<ICity[]> {
  return City.find(options).skip(skip).limit(limit);
}

//queue building
//add bonus harvest stat by building

export default {
  create,
  build,
  find,
};
