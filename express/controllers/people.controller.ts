import { Gender, Job, Race, Stats } from "../enums/enum";
import People, { IPeople } from "../models/people.model";
import { nameByRace } from "fantasy-name-generator";
import mongoose from "mongoose";
import { randomEnum, randomIntFromInterval } from "../helper/utils.helper";

function generatePeople(): IPeople {
  const race = randomEnum(Race);
  const gender = randomEnum(Gender);

  return {
    name: randomeName(race, gender),
    age: randomAge(),
    gender: randomEnum(Gender),
    job: randomEnum(Job),
    city: mongoose.Types.ObjectId(),
    race: race,
  } as IPeople;
}

//increase exp job,

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

async function find(options: any): Promise<IPeople[]> {
  return People.find(options);
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
  enterInCity,
  increaseExperience,
  levelUp,
  create,
  insertMany,
  findById,
  findOne,
  find,
  randomAge,
  randomeName,
};
