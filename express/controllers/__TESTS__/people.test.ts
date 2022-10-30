const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
import { IPeople } from "../../models/people.model";
import peopleController from "../people.controller";
import cityController from "../city.controller";
import { ICity } from "~~/models/city.model";
import { randomIntFromInterval } from "../../helper/utils.helper";

const mongod = new MongoMemoryServer();
const fakeDataBase = true;

describe("User controller", () => {
  beforeAll(async () => {
    if (!fakeDataBase) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
      });
    } else {
      const uri = await mongod.getUri();

      const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
      };

      await mongoose.connect(uri, mongooseOpts);
    }
  });

  afterAll(async () => {
    if (!fakeDataBase) {
      mongoose.connection.close();
    } else {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
      await mongod.stop();
    }
  });

  it("Should create a people", async () => {
    const people = peopleController.generatePeople();

    const peopleCreated = await peopleController.create(people);
    expect(peopleCreated.name).toEqual(people.name);
    expect(peopleCreated.age).toEqual(people.age);
    expect(peopleCreated.gender).toEqual(people.gender);
  });

  it("find all people", async () => {
    const peopleCreated = await peopleController.find({});
    expect(peopleCreated.length).toBeGreaterThan(0);
  });

  it("Should create many peoples", async () => {
    const peoples: IPeople[] = [];
    for (let index = 0; index < 999; index++) {
      peoples.push(peopleController.generatePeople());
    }

    const peoplesCreated = await peopleController.insertMany(peoples);

    peoplesCreated.forEach((people, index) => {
      expect(peoples[index].name).toEqual(people.name);
      expect(peoples[index].age).toEqual(people.age);
      expect(peoples[index].gender).toEqual(people.gender);
    });
  });

  it("Should create a city", async () => {
    const cityCreated = await cityController.create({
      name: "test",
    } as ICity);

    const peoples = await peopleController.find({});

    const entered = await peopleController.enterInCity(
      peoples[0]._id!,
      cityCreated._id
    );

    expect(entered?.city).toEqual(cityCreated._id);
  });

  it("Should level up a people", async () => {
    const peoples = await peopleController.find({});

    const peopleUpdated = await peopleController.levelUp(peoples[0]._id!);
  });

  it("Should gain experience a people", async () => {
    const peoples = await peopleController.find({});
    let peopleUpdated = peoples[0];
    for (let index = 0; index < 100; index++) {
      peopleUpdated = await peopleController.increaseExperience(
        peoples[0]._id!,
        randomIntFromInterval(1, 100)
      );
    }
    expect(peopleUpdated.level).toBeGreaterThan(1);
    expect(peopleUpdated.health).toBeGreaterThan(1);
    expect(peopleUpdated.endurence).toBeGreaterThan(1);
    expect(peopleUpdated.dexterity).toBeGreaterThan(1);
  });
});
