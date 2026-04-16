const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const userApiRoutes = require('./routes/api/userRoute');
const webRoutes = require('./routes/web/index');

app.use('/', webRoutes);

app.use('/api/users', userApiRoutes);

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});
