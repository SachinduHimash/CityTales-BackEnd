const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// const port = process.env.PORT;
const port = 4000;

const formidable = require('formidable');

var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const firebase = require('firebase');
var admin = require("firebase-admin");
var serviceAccount = require('./ServiceAccountKey.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://citytales-5568e.appspot.com" //storage bucket url
});

const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: "https://citytales-5568e-default-rtdb.firebaseio.com",
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  };

firebase.initializeApp(firebaseConfig);

let database = firebase.database();
const bucket = admin.storage().bucket(); 

const { v4: uuidv4 } = require('uuid');

app.get('/', (req, res) => {

  res.send('Hello World!');

});

app.post('/upload', async(req, res) => {

  //initialise formidable
  const form = formidable.formidable({multiple: true})

  form.parse(req, async (err, fields, files) => {
     if(err) {
        res.status(500).json({success: false, error: err})
     } else {

        let image_url; //to save the download url
        
        // path to image 
        const filePath = files['photo'][0].filepath;
        const story = fields['story'][0];

        if (filePath){
              //set a preferred path on firebase storage
            const remoteFilePath = "images/"+uuidv4().toString()+".jpg";

            /* upload the image using the bucket.upload() function which takes in 2
              arguments 1. the file path and 2. an object containing additional 
              informations like gzip, metadata, destination e.t.c
              we will be handling only the destination key as firebase handles the
              rest automatically. bucket.upload() is a promise hence the await keyword
            */
            await bucket.upload(filePath, { destination: remoteFilePath });

            // options for the getSignedUrl() function
            const options = {
              action: 'read',
              expires: Date.now() + 24 * 60 * 60 * 1000 // 1 day
            }
      
            // The right hand side returns an array of signedUrl
            let signedUrl = await bucket.file(remoteFilePath).getSignedUrl(options);
            
            image_url = signedUrl[0]; // save the signed Url to image_url
    
        }
        let id = uuidv4().toString();
        let data = {story,image_url,id}
        database.ref(`stories/${id}`).set(data, function(error) {
          if (error) {
          // The write failed...
          res.status(500).json({success: false, error})
        } else {
          // The write was successful...
          res.status(200).json({success: true});     
        }
      })

        //send image url back to frontend
      }
  })
})


app.listen(port, () => {

  // console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Example app listening at http://localhost:4000`);


});