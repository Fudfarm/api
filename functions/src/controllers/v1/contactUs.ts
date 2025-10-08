import { Request, Response } from "express";
import { sendEmail } from "../../utils/mailer";
import { getOrCreateSystemInfo } from "./system/helper";
import { handleError } from "../../function/error";
import { contactUsSystemEmailBody, contactUsUserEmailBody } from "../../emails/contactUs";
import { config } from "../../config";

export const contactUs = async (req: Request, res: Response) => {
  try {
    // 2️⃣ Get system contact email
    const info = await getOrCreateSystemInfo();
    const systemEmail = info.contactEmail;
    if (!systemEmail) {
      return res.status(500).json({ message: "System contact email not configured" });
    }

    const { fullname, email, phone, title, body } = req.body;

    // 3️⃣ Send email to system/support
    await sendEmail({
      to: systemEmail,
      cc: email ? email : undefined,
      subject: `New Contact Message: ${title}`,
      title: `New Contact Message from ${fullname}`,
      body: contactUsSystemEmailBody({
        fullname: fullname,
        email: email,
        phone: phone,
        title: title,
        message: body,
        appName: config.appName,
      }),
    });

    // 4️⃣ Send confirmation email to user if email is provided
    if (email) {
      await sendEmail({
        to: email,
        subject: `We received your message: ${title}`,
        title: "Message Received",
        body: contactUsUserEmailBody({
          fullname: fullname,
          title: title,
        }),
      });
    }

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (err: any) {
    if (err?.errors) {
      // Zod validation errors
      return res.status(400).json({ errors: err.errors });
    }
    return handleError(err, res, "Error sending contact message");
  }
};
