const functions = require('firebase-functions');
const axios = require('axios');
const admin = require('firebase-admin')

const requestOtp = require('./routes/request_otp')
const verifyOtp = require('./routes/verify_otp')


const serviceAccount = require('./secret/firebase_admin_key');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://todoapp-fbe30.firebaseio.com"
  });


exports.requestOtp = functions.https.onRequest(requestOtp);
exports.verifyOtp = functions.https.onRequest(verifyOtp);

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
