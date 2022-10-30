import { Gender, Race, Stats } from "../enums/enum";
import People, { IPeople } from "../models/people.model";
import { nameByRace } from "fantasy-name-generator";
import mongoose from "mongoose";
import cityModel from "../models/city.model";

function generatePeople(): IPeople {
  const race = randomEnum(Race);
  const gender = randomEnum(Gender);

  return {
    name: randomeName(race, gender),
    age: randomAge(),
    gender: randomEnum(Gender),
    city: mongoose.Types.ObjectId(),
    race: race,
  } as IPeople;
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

async function levelUp(idPeople: string) {
  const increaseStat = randomEnum(Stats);
  return People.findByIdAndUpdate(
    idPeople,
    { $inc: { [increaseStat]: 1 } },
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

function randomEnum<T>(enumeration: any) {
  const keys = Object.keys(enumeration).filter(
    (k) => !(Math.abs(Number.parseInt(k)) + 1)
  );
  const enumKey = keys[Math.floor(Math.random() * keys.length)];
  return enumeration[enumKey];
}

function randomAge(): number {
  return randomIntFromInterval(1, 100);
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomeName(race: Race, gender: Gender) {
  return nameByRace(race, { gender });
}

export default {
  generatePeople,
  enterInCity,
  levelUp,
  create,
  insertMany,
  findById,
  findOne,
  find,
  randomEnum,
  randomAge,
  randomeName,
};
