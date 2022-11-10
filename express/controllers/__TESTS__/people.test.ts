const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
import { IPeople } from "../../models/people.model";
import peopleController from "../people.controller";
import cityController from "../city.controller";
import { ICity } from "../../models/city.model";
import { randomEnum, randomIntFromInterval } from "../../helper/utils.helper";
import { Item, Job } from "../../enums/enum";

const countPeople = 100;
const mongod = new MongoMemoryServer();
const fakeDataBase = true;

describe("User controller", () => {
  beforeAll(async () => {
    if (!fakeDataBase) {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      });
    } else {
      const uri = await mongod.getUri();

      const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        useUnifiedTopology: true,
        useFindAndModify: false,
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
    for (let index = 0; index < countPeople - 1; index++) {
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

    const peoples = await peopleController.find({}, 0, 0);

    for (let index = 0; index < peoples.length; index++) {
      const entered = await peopleController.enterInCity(
        peoples[index]._id!,
        cityCreated._id
      );

      expect(entered?.city).toEqual(cityCreated._id);
    }
  });

  it("Should level up a people", async () => {
    const peoples = await peopleController.find({}, 0, 1);

    const peopleUpdated = await peopleController.levelUp(peoples[0]._id!);
  });

  it("Should gain experience a people", async () => {
    const peoples = await peopleController.find({}, 0, 1);
    let peopleUpdated = peoples[0];
    for (let index = 0; index < countPeople; index++) {
      peopleUpdated = await peopleController.increaseExperience(
        peoples[0]._id!,
        randomIntFromInterval(10, 100)
      );
    }
    expect(peopleUpdated.level).toBeGreaterThan(1);
    expect(peopleUpdated.health).toBeGreaterThan(1);
    expect(peopleUpdated.endurence).toBeGreaterThan(1);
    expect(peopleUpdated.dexterity).toBeGreaterThan(1);
  });

  it("Should change job of people", async () => {
    const peoples = await peopleController.find({}, 0, 1);
    const newJob = randomEnum(Job);
    const peopleUpdated = await peopleController.changeJob(
      peoples[0]._id!,
      newJob
    );
    expect(peopleUpdated?.job).toEqual(newJob);
  });

  it("Should gain experience a people", async () => {
    const peoples = await peopleController.find({}, 0, 1);
    const job = randomEnum(Job) as Job;
    const peopleUpdated = await peopleController.increaseJobExperience(
      peoples[0]._id!,
      job
    );
    expect(peopleUpdated.jobsExperience[job]).toEqual(
      peoples[0].jobsExperience[job] + 1
    );
  });

  it("Should gain item", async () => {
    const peoples = await peopleController.find({}, 0, 1);
    const item = randomEnum(Item) as Item;
    const peopleUpdated = await peopleController.increaseItem(
      peoples[0]._id!,
      item
    );

    const itemExpected = peoples[0].items[item]
      ? peoples[0].items[item] + 1
      : 1;
    expect(peopleUpdated.items[item]).toEqual(itemExpected);
  });

  it("Should put item into city", async () => {
    const peoples = await peopleController.find({}, 0, 1);
    const cityUpdated = await peopleController.putItemInCity(peoples[0]._id!);
    expect(cityUpdated.items).toEqual(peoples[0].items);
  });

  it("Do Job", async () => {
    const peoples = await peopleController.find({}, 0, 0);
    for (let index = 0; index < peoples.length; index++) {
      for (let index = 0; index < randomIntFromInterval(1, 30); index++) {
        const items = await peopleController.doJob(peoples[index]);
        if (items) await peopleController.putItemInCity(peoples[index]._id!);
      }
    }
  });
});
