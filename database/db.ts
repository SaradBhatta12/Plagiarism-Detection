import { AppDataSource } from "../TypeOrm.config";

export const getDb = async () => {
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
    } catch (err) {
      console.error("Error during Data Source initialization", err);
      throw err;
    }
  }
  return AppDataSource;
};
