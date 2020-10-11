# Bemo App Backend API
 
This repository contains the code for the Bemo App backend API.
The code written here is intended to be run in a NodeJS v12.13.0 environment.
 
Once you have cloned the code on to your local machine, ensure you run `npm install` to install all necessary packages.
 
## Environmental Variables
 
The bemo backend requires a few environmental variables in order to begin. These are:
 
```
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_APP_ID=
SESSION_SECRET=<Whatever you want>
TWILIO_API_KEY=
MONGODB_URI=
```
 
It will be explained what to put into each of these variables later in the document.
 
### MongoDB
 
The Bemo App backend uses a Mongo database to store all user information, payments and messages. Because of this, you will need to connect a MongoDB Atlas database to the project through the API. All the programme needs is the URI for the database to be placed in the `MONGODB_URI` field in the .env file. Here is how you can get a MongoDB URI:
 
1. **Network Access** - Create an account for MongoDB Atlas and set up a new project and cluster. ([https://cloud.mongodb.com/](https://cloud.mongodb.com/))
  Once you have a cluster set up, you need to allow connection access to your devices IP.
  To do this, find the "Network Access" tab, then click "Add IP Address". Here you can either put your IP address or 0.0.0.0 which will allow access on from connections.
2. **Database Access** - Now you must go to the "Database Access" tab and click "Add new database user". Here you can create a new user. Feel free to give it any name and password, just make sure to remember these login details as you will need them in the next step. Give this user permission to "Read and write to any database".
3. **Database URI** - Now you're going to need a Database URI to add to the application. To do this, go to the "Clusters" tab and click "Connect" on the cluster, then select "Connect your application".
  This will generate a code similar to this: `mongodb+srv://<username>:<password>@exampleapp.gxthx.mongodb.net/<dbname>?retryWrites=true&w=majority`
  You should replace <username> with the username of the user you created in the previous step and replace <password> with the password of that user. Then replace <dbname> with "bemo" (It doesn't actually matter what you call this, we like to use bemo as it describes what the database is for).
4. **.env variables** - Now that you have that code generated above (the mongodb+srv code), paste that into the MONGODB_URI variable in your .env file. That is all the set up required for MongoDB.
 
### Firebase
 
The backend uses Firebase to interface Google Cloud Storage which we use to host user's media content (such as profile photos). You will need a few things to get Firebase working in the application.
 
1. **Create Project** - First thing to do is create a Firebase project ([https://console.firebase.google.com/](https://console.firebase.google.com/)). Feel free to name the project anything you wish.
2. **Setup Firebase Storage** - In the sidebar of Firebase, under the "Develop" section there is a "Storage" tab. Enter this tab and set up Storage.
3. **Get Firebase config** - Go up to the top of the sidebar, next to Project Overview and click the little settings icon. This will put you into the general settings page. Go to the bottom of that page and you will find a section named "Firebase SDK snippet". From here, click "Config". This will show you a JSON file similar to this:
 
  ```js
  {
    apiKey: "AIzazyCSeUKls2Ri7cLsUQafejyt234gStTAlSGoQ",
    authDomain: "example.firebaseapp.com",
    databaseURL: "https://example.firebaseio.com",
    projectId: "example",
    storageBucket: "example.appspot.com",
    messagingSenderId: "1001460123743",
    appId: "1:1201260412545:web:851243be0c1313fb82aa0"
  }
  ```
 
  From here, you can copy a few variables out of here into the .env file.
  FIREBASE_API_KEY will be the "apiKey"
  FIREBASE_PROJECT_ID will be the "projectId"
  FIREBASE_STORAGE_BUCKET will be the "storageBucket"
  and FIREBASE_APP_ID will be the "appId" variable.
 
4. Lastly, you're going to need a serviceAccountKey.json file. To get this, go to the top of the settings page and click "Service Accounts", from here, scroll down to "Generate new private key". Download the file, rename it to "serviceAccountKey.json" and place it in the root of the application.
 
Now you are done setting up Firebase.
 
### Twilio
 
You will need to sign up for Twilio ([https://www.twilio.com/console](https://www.twilio.com/console)). From here, you can claim your free trial and generate an API key. This key will be placed in the `TWILIO_API_KEY` variable in your .env file.
 
## Start the API!
 
Now that your env file is finished and your firebase service key is set up, you will need to start the application up. Here you have two options. You can start the API in dev mode, meaning that any changes you make to the code will cause the server to restart (useful while developing). To accomplish this, run `npm run dev`.
Otherwise, you can run `npm run start` which will run the server and any later changes to the code will not be reflected in the running server.