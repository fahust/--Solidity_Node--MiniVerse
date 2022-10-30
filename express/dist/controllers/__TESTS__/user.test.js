"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_controller_1 = __importDefault(require("../user.controller"));
describe('User controller', () => {
    beforeAll(async () => {
        await mongoose_1.default.connect(global.__MONGO_URI__, {
            useNewUrlParser: true
        });
    });
    afterAll(async () => {
        mongoose_1.default.connection.close();
    });
    it('Should create a user', async () => {
        const email = 'text@example.com';
        const user = await user_controller_1.default.CreateUser({
            email,
            firstName: 'Test first name',
            lastName: 'Test last name'
        });
        expect(user.email).toEqual(email);
    });
    it('Should enforce the gender ennum', async () => {
        try {
            await user_controller_1.default.CreateUser({
                email: 'text@example.com',
                firstName: 'Test first name',
                lastName: 'Test last name',
                // @ts-ignore
                gender: 'not a gender'
            });
        }
        catch (e) {
            expect(e.message).toBe('User validation failed: gender: `not a gender` is not a valid enum value for path `gender`.');
        }
    });
});
