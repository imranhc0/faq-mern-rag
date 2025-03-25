import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { openAPI, emailOTP, jwt } from "better-auth/plugins";
import { sendEmail } from "./email.js";



const db = new MongoClient("mongodb://localhost:27017/").db("testAPP2");


export const auth = betterAuth({
    database: mongodbAdapter(db),
    secret: "e7d997741b2fe633528996b32f9702469093fac213cfbd8bed68701abca35e84",
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }) => {
            // Implement the sendVerificationEmail method to send the verification email to the user
            await sendEmail(user.email, "Verify your email", `<strong>Click <a href="${url}">here</a> to verify your email</strong>`);
        },
        sendOnSignUp: true,
    },
    jwt: {
        enabled: true,
    },
    secret: "mySecret",
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

});