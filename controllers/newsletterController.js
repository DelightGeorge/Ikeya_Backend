import {
  sendNewsletterWelcomeEmail,
  sendAdminNewsletterAlertEmail,
} from "../utils/emailVerification.js";

export const subscribe = async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email address is required." });
  }

  try {
    // Send welcome email to subscriber (non-blocking)
    sendNewsletterWelcomeEmail(email)
      .catch((err) => console.error("Newsletter welcome email failed:", err));

    // Notify admin (non-blocking)
    sendAdminNewsletterAlertEmail(email)
      .catch((err) => console.error("Admin newsletter alert failed:", err));

    res.status(200).json({ message: "Subscribed successfully." });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Could not process subscription." });
  }
};
