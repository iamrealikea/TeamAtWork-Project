const express = require('express');
const path = require('path');
require('dotenv').config();
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
    // TODO: If user is not logged in, redirect to login page.
    // We gonna redirect if we have authentication implemented.
    res.render('dashboard/dashboard', { 
        user: { 
            name: 'John Doe', 
            email: 'john.doe@example.com',
            avatar: '/images/default-avatar.png' 
            } 
        });
});

app.listen(port, () => {
console.log(`Server running at http://localhost:${port}`);
});