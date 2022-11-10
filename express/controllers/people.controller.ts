import { Gender, Item, Job, Race, Stats } from "../enums/enum";
import People, { IPeople } from "../models/people.model";
import { nameByRace } from "fantasy-name-generator";
import mongoose from "mongoose";
import { randomEnum, randomIntFromInterval } from "../helper/utils.helper";
import cityModel from "../models/city.model";

function generatePeople(): IPeople {
  const race = randomEnum(Race);
  const gender = randomEnum(Gender);

  const jobsExperience = {} as Record<string, number>;
  const jobKeys = Object.keys(Job).filter(
    (k) => !(Math.abs(Number.parseInt(k)) + 1)
  );
  jobKeys.forEach((_, i) => {
    jobsExperience[jobKeys[i]] = 0;
  });

  return {
    name: randomeName(race, gender),
    age: randomAge(),
    gender: randomEnum(Gender),
    job: randomEnum(Job),
    city: mongoose.Types.ObjectId(),
    race: race,
    jobsExperience,
  } as IPeople;
}

function increaseItem(idPeople: string, item: Item) {
  const itemKey = "items." + item;
  return People.findByIdAndUpdate(
    idPeople,
    {
      $inc: {
        [itemKey]: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

async function putItemInCity(idPeople: string) {
  const people = await People.findByIdAndUpdate(idPeople, {
    $set: { items: {} },
  });

  const items = {} as Record<string, number>;
  Object.keys(people!.items).forEach((item) => {
    items["items." + item] = people!.items[item as Item];
  });

  await cityModel.findByIdAndUpdate(
    people?.city,
    {
      $inc: items,
    },
    {
      new: true,
      upsert: true,
    }
  );
}

function changeJob(idPeople: string, job: Job) {
  return People.findByIdAndUpdate(
    idPeople,
    {
      $set: {
        job: job,
      },
    },
    {
      new: true,
    }
  );
}

function increaseJobExperience(idPeople: string, job: Job) {
  const jobKey = "jobsExperience." + job;
  return People.findByIdAndUpdate(
    idPeople,
    {
      $inc: {
        [jobKey]: 1,
      },
    },
    {
      new: true,
      upsert: true,
    }
  );
}

async function enterInCity(idPeople: string, idCity: string) {
  return People.findByIdAndUpdate(
    idPeople,
    {
      $set: {
        city: idCity,
      },
    },
    {
      new: true,
    }
  );
}

async function increaseExperience(idPeople: string, experience: number) {
  const peopleUpdated = await People.findByIdAndUpdate(
    idPeople,
    { $inc: { experience: experience } },
    { new: true, upsert: true }
  );
  if (peopleUpdated.experience > maxExperience(peopleUpdated))
    return levelUp(peopleUpdated._id!);
  return peopleUpdated;
}

async function levelUp(idPeople: string) {
  const increaseStat = randomEnum(Stats);
  return People.findByIdAndUpdate(
    idPeople,
    { $set: { experience: 0 }, $inc: { [increaseStat]: 1, level: 1 } },
    { new: true, upsert: true }
  );
}

async function create(people: IPeople): Promise<IPeople> {
  return People.create(people);
}

async function insertMany(peoples: IPeople[]): Promise<IPeople[]> {
  return People.insertMany(peoples);
}

async function findById(id: string): Promise<IPeople | null> {
  return People.findById(id);
}

async function findOne(options: any): Promise<IPeople | null> {
  return People.findOne(options);
}

async function find(options: any, skip = 0, limit = 0): Promise<IPeople[]> {
  return People.find(options).skip(skip).limit(limit);
}

function randomAge(): number {
  return randomIntFromInterval(1, 100);
}

function maxExperience(people: IPeople) {
  return 100 + people.level * people.level;
}

function randomeName(race: Race, gender: Gender) {
  return nameByRace(race, { gender });
}

export default {
  generatePeople,
  changeJob,
  enterInCity,
  increaseExperience,
  increaseJobExperience,
  increaseItem,
  putItemInCity,
  levelUp,
  create,
  insertMany,
  findById,
  findOne,
  find,
  randomAge,
  randomeName,
};
