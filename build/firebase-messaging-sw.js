// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.1/firebase-messaging.js');

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAC6U0qAtQegHkMh73_WCSUfwt-B5Ehzbo",
  authDomain: "nkchat-9c490.firebaseapp.com",
  databaseURL: "https://nkchat-9c490-default-rtdb.firebaseio.com",
  projectId: "nkchat-9c490",
  storageBucket: "nkchat-9c490.appspot.com",
  messagingSenderId: "3841888162",
  appId: "1:3841888162:web:e97be8eb9d728762e72cfb",
  measurementId: "G-2RRSVBZ6BE"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'You have new message';
    const notificationOptions = {
        body: payload.data.message,
        icon: payload.data.icon
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
