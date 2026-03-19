import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendEmail({ to, subject, html, text }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email will not be sent.");
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: "Perplexity <onboarding@resend.dev>", // Or your verified domain
            to: Array.isArray(to) ? to : [ to ],
            subject,
            html,
            text
        });

        if (error) {
            console.error("Resend error:", error);
            throw new Error(`Email failed: ${error.message}`);
        }

        console.log("Email sent successfully via Resend:", data.id);
        return data;
    } catch (err) {
        console.error("Failed to send email through Resend:", err.message);
        throw err;
    }
}