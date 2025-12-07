import cron from "node-cron";
import { bookingService } from "../modules/booking/booking.service";


// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running auto-return job...");
  await bookingService.autoReturnBookings();
});
