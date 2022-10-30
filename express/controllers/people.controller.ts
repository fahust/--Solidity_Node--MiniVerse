import People, { IPeople } from "../models/people.model";

async function createPeople(people: IPeople): Promise<IPeople> {
  return People.create(people);
}

async function findPeople(people: IPeople): Promise<IPeople> {
  return People.create(people);
}

export default {
  createPeople,
};
