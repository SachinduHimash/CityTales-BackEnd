const express = require('express');

const app = express();

const port = process.env.PORT;

var cors = require('cors');
app.use(cors());
app.use(express.json());

const firebase = require('firebase');

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  };

firebase.initializeApp(firebaseConfig);

let database = firebase.database()


app.get('/', (req, res) => {

  res.send('Hello World!');

});

app.post('/upload', (req, res) => {
    const { story } = req.body;
    console.log(story)


    database.ref("stories/").set(story, function(error) {
        if (error) {
        // The write failed...
        console.log("Failed with error: " + error)
        } else {
        // The write was successful...
        console.log("success")
        }
    })



    res.send({
        message: 'Upload successful',
     });
});


app.listen(port, () => {

  console.log(`Example app listening at http://localhost:${port}`);

});