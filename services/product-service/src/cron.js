import cron from "node-cron";
import productController from "./controllers/productController.js";

/**
 * Schedule cron job for periodic ingestion (every 12 hours)
 */
const scheduleCronJob = () => {
  cron.schedule("0 */12 * * *", async () => {
    console.log("Starting scheduled product ingestion...");
    try {
      const result = await productController.performIngestion();
      console.log("Scheduled ingestion completed:", result);
    } catch (error) {
      console.error("Scheduled ingestion failed:", error);
    }
  });
  console.log("Cron job scheduled: Product ingestion every 12 hours");
};

export default scheduleCronJob;
