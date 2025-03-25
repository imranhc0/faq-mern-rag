// import express from "express";
import {betterAuth} from "better-auth";
// import {toNodeHandler} from "better-auth/node";
import {mongodbAdapter} from "better-auth/adapters/mongodb";
import {sendEmail} from "../utils/email.js";
import {emailOTP, jwt, openAPI} from "better-auth/plugins";
import {client} from "../config/db.js";
// const router = express.Router();


export const auth = betterAuth({
    database: mongodbAdapter(client),
    secret: "e7d997741b2fe633528996b32f9702469093fac213cfbd8bed68701abca35e84",
    emailVerification: {
        sendVerificationEmail: async (data) => {
            const { user, url, token } = data;
            console.log(data)
            // Implement the sendVerificationEmail method to send the verification email to the user
            await sendEmail(user.email, "Verify your email", `<strong>Click <a href="${url}">here</a> to verify your email</strong>`);
        },
        sendOnSignUp: true,
    },
    jwt: {
        enabled: true,
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
            // Implement the sendVerificationEmail method to send the verification email to the user
            await sendEmail(user.email, "Verify your email", `<strong>Click <a href="${url}">here</a> to verify your email</strong>`);
        },
    },
    plugins: [openAPI(), emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
            // Implement the sendVerificationOTP method to send the OTP to the user's email address
            await sendEmail(email, "Verification OTP", `<strong>Your verification OTP is ${otp}</strong>`);
        },
    }), jwt()],
    user: {
        modelName: 'User'
    },
    rateLimit: {
      window: 10, // time window in seconds
      max: 100, // max requests in the window
    },

});
