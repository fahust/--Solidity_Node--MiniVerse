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
    const people = Controller.generatePeople();

    const peopleCreated = await Controller.create(people);
    expect(peopleCreated.name).toEqual(people.name);
    expect(peopleCreated.age).toEqual(people.age);
    expect(peopleCreated.gender).toEqual(people.gender);
  });

  it("find all people", async () => {
    const peopleCreated = await Controller.find({});
    expect(peopleCreated.length).toBeGreaterThan(0);
  });

  it("Should create many peoples", async () => {
    const peoples: IPeople[] = [];
    for (let index = 0; index < 999; index++) {
      peoples.push(Controller.generatePeople());
    }

    const peoplesCreated = await Controller.insertMany(peoples);
    
    peoplesCreated.forEach((people, index) => {
      expect(peoples[index].name).toEqual(people.name);
      expect(peoples[index].age).toEqual(people.age);
      expect(peoples[index].gender).toEqual(people.gender);
    });
  });
});
