import { Request, Response } from "express";
import { sendEmail } from "../../utils/mailer";
import { handleError } from "../../function/error";
import { getOrCreateSystemInfo } from "./system/getSystemInfo";
import { feedbackBotSystemEmailBody, feedbackBotUserEmailBody } from "../../emails/feedback";

export const feedbackBotContact = async (req: Request, res: Response) => {
  try {
    const { fullname, email, phone, body, receiveFeedback, rating, type, image1, image2 } = req.body;

    // Get system contact email
    const info = await getOrCreateSystemInfo();
    const systemEmail = info.contactEmail;
    if (!systemEmail) return res.status(500).json({ message: "System email not configured" });

    // Prepare attachments
    const attachments = [];
    if (image1) attachments.push({ filename: "image1.jpg", path: image1 });
    if (image2) attachments.push({ filename: "image2.jpg", path: image2 });

    // Send to system/support
    await sendEmail({
      to: systemEmail,
      subject: `New Feedback Bot Message: ${type}`,
      title: `Message from ${fullname}`,
      body: feedbackBotSystemEmailBody({
        fullname,
        email,
        phone,
        body,
        rating,
        type,
      }),
      attachments,
    });

    // Send confirmation to user if they want feedback
    if (receiveFeedback && email) {
      await sendEmail({
        to: email,
        subject: `We received your feedback: ${type}`,
        title: "Feedback Received",
        body: feedbackBotUserEmailBody({ fullname: fullname, type: type }),
      });
    }

    return res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (err: any) {
    if (err?.errors) return res.status(400).json({ errors: err.errors });
    return handleError(err, res, "Error submitting feedback");
  }
};
