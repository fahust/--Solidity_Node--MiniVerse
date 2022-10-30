"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../user.model"));
describe("User model", () => {
    beforeAll(async () => {
        await mongoose_1.default.connect(global.__MONGO_URI__, {
            useNewUrlParser: true
        });
    });
    afterAll(async () => {
        mongoose_1.default.connection.close();
    });
    it("Should throw validation errors", () => {
        const user = new user_model_1.default();
        expect(user.validate).toThrow();
    });
    it("Should save a user", async () => {
        expect.assertions(3);
        const user = new user_model_1.default({
            firstName: "Test first name",
            lastName: "Test last name",
            email: "test@example.com"
        });
        const spy = jest.spyOn(user, "save");
        // Should await so the teardown doesn't throw an exception
        // Thanks @briosheje
        user.save();
        expect(spy).toHaveBeenCalled();
        expect(user).toMatchObject({
            firstName: expect.any(String),
            lastName: expect.any(String),
            email: expect.any(String)
        });
        expect(user.email).toBe("test@example.com");
    });
});
