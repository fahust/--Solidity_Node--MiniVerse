const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
import { Gender, Race } from "../../enums/enum";
import { IPeople } from "../../models/people.model";
import Controller from "../people.controller";

const mongod = new MongoMemoryServer();

describe("User controller", () => {
  beforeAll(async () => {
    const uri = await mongod.getUri();

    const mongooseOpts = {
      useNewUrlParser: true,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
    };

    await mongoose.connect(uri, mongooseOpts);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  });

  it("Should create a people", async () => {
    const race = Controller.randomEnum(Race);
    const gender = Controller.randomEnum(Gender);

    const people = {
      name: Controller.randomeName(race, gender),
      age: Controller.randomAge(),
      gender: Controller.randomEnum(Gender),
      race: race,
    } as IPeople;

    const peopleCreated = await Controller.create(people);
    expect(peopleCreated.name).toEqual(people.name);
    expect(peopleCreated.age).toEqual(people.age);
    expect(peopleCreated.gender).toEqual(people.gender);
  });

  it("find all people", async () => {
    const peopleCreated = await Controller.find({});
    expect(peopleCreated.length).toBeGreaterThan(0);
  });
});
