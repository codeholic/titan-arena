/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
};

const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
