import dotenv from "dotenv";
dotenv.config();

const { default: app } = await import("./app.js");
const { connectDB } = await import("./config/db.js");

const PORT = Number(process.env.PORT) || 5000;

await connectDB();

app.listen(PORT, () => {
  console.log(`API en http://localhost:${PORT}`);
});