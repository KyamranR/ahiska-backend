const fs = require("fs");
const db = require("./db");

async function initDb() {
  try {
    const schema = fs.readFileSync(__dirname + "/ahiska-schema.sql", "utf8");
    await db.query(schema);
    console.log("Database schema created successfully!");
  } catch (err) {
    console.error("Error creating schema:", err);
  } finally {
    db.end();
  }
}

initDb();
