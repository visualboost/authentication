import {TestDataHandler} from "./data/TestDataHandler.ts";

const addTestData = async () => {
    await TestDataHandler.connectToDb();
    await TestDataHandler.dropUser();
    await TestDataHandler.addBigAmountOfUser(100000);
    // await TestDataHandler.addRoles();
    await TestDataHandler.closeConnection();
}

addTestData();

