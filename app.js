const express = require("express");
const config = require("config");
const mongoose = require("mongoose");

const app = express();

app.use(express.json({ extended: true }));  

app.use("/api/forge", require("./routes/forge.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));

app.get("*", (req, res) => {  
  res.send(`BIMgen Server is running. Lets hack...`);
});

const PORT = config.get('port') || 5000

async function start() {
  try {
    console.log("try to connect to mongo...");
    await mongoose.connect(config.get("mongoUri"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    app.listen(PORT, () => console.log(`App has been started on port ${PORT}...`));
  } catch (e) {
    console.log("Server error", e.message);
    process.exit(1);
  }
}

start();
