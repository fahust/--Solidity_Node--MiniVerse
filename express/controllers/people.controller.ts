import { Gender } from "../enums/enum";
import People, { IPeople } from "../models/people.model";

async function create(people: IPeople): Promise<IPeople> {
  return People.create(people);
}

async function findById(id: string): Promise<IPeople | null> {
  return People.findById(id);
}

function randomGender(): string {
  const values = Object.keys(Gender);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  return enumKey;
}

function randomAge(): number {
  return randomIntFromInterval(1, 100);
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default {
  create,
  findById,
  randomGender,
  randomAge,
};
