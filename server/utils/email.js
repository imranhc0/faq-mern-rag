import { Resend } from "resend";
import { configDotenv } from "dotenv";


configDotenv();

const resend = new Resend(process.env.RESEND_API_KEY);


export const sendEmail = async (email, subject, message) => {
    const { data, error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: email,
        subject,
        html: message
    });

    if (error) {
        console.error(error);
        return error;
    }
    console.log(data);

    return data;
}