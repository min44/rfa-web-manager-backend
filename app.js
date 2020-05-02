const express = require("express");
const config = require("config");
const mongoose = require("mongoose");
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();

app.use(express.json({ extended: true }));  
app.use(cors());

app.use("/api/forge", require("./routes/forge.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", require("./routes/users.routes"));
app.get("/", (req, res) => {  
  res.send(`BIMgen Server is running. Lets hack...`);
});

const PORT = config.get('port') || 5000

// serve the API with signed certificate on 443 (SSL/HTTPS) port
const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/api.bimgen.org/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/api.bimgen.org/fullchain.pem'),
}, app);
httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

// serve the API on 80 (HTTP) port
const httpServer = http.createServer(app);
httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

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
