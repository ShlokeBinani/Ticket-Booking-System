import { sendEmail } from "./artifacts/api-server/src/mailer.js";
sendEmail("shlokebinani@gmail.com", "Test", "Test body").then(() => console.log("Done")).catch(e => console.error("Error", e));
