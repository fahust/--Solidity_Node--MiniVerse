const mongoose = require("mongoose");
import { IPeople } from "~~/models/people.model";
import Controller from "../people.controller";

describe("User controller", () => {
  const ENV = process.env;
  console.log(ENV)
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    mongoose.connection.close();
  });
  it("Should create a people", async () => {
    const people = {
      name: "test",
      age: Controller.randomAge(),
      gender: Controller.randomGender(),
    } as IPeople;

    const peopleCreated = await Controller.create(people);
    console.log(peopleCreated);
    //expect(user.email).toEqual(email);
  });
});
