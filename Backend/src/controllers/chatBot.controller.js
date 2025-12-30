import Medication from "../DataModels/medication.model.js";
import User from "../DataModels/user.model.js";
import DoseLog from "../DataModels/doselog.model.js";
import { askGemini } from "../utils/askGemini.js";
import { DateTime } from "luxon";

export const chatHandler = async (req, res) => {
  console.log("chat request received");

  try {
    const {
      email,
      message,
      recentMessages = [],
      summary = ""
    } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const todayReadable = nowIST.toFormat("cccc, dd LLLL yyyy");
    
    const meds = await Medication.find({
      user: user._id,
      startDate: { $lte: nowIST },
      endDate: { $gte: nowIST },
      active: true
    });
    const medicineContext = meds.length
      ? meds
          .map(
            m =>
              `• ${m.name} (${m.dosage}) – ${m.frequency}, times: ${m.times.join(
                ", "
              )}`
          )
          .join("\n")
      : "No medication data found.";

    const todayDate = DateTime.now()
      .setZone("Asia/Kolkata")
      .startOf("day")
      .toJSDate();

    const todayDoseLogs = await DoseLog.find({
      user: user._id,
      date: todayDate
    })
    .populate("medicationId", "name dosage");

    const doseLogContext = todayDoseLogs.length
      ? todayDoseLogs
          .map(
            log =>
              `• ${log.medicationId?.name || "Unknown"} at ${log.time} → ${
                log.status
              }`
          )
          .join("\n")
      : "No dose logs for today.";

    const conversationContext = recentMessages.length
      ? recentMessages
          .map(
            m =>
              `${m.sender === "user" ? "User" : "Assistant"}: ${m.text}`
          )
          .join("\n")
      : "No previous conversation.";

    const fullPrompt = `
You are Saarthi Agent, a calm and professional health assistant.

User Name:
${user.name || "User"}

Current Date (IST):
${todayReadable}

Conversation Summary (so far):
${summary || "None"}

Recent Conversation:
${conversationContext}

Current User Message:
"${message}"

Medication List:
${medicineContext}

Today's Dose Logs:
${doseLogContext}

IMPORTANT:
1. Answer the user's question clearly in 1–2 sentences.
2. Update the conversation summary to include this interaction.
3. The summary MUST be 1–5 lines.
4. Do NOT include raw dialogue in the summary.

FORMAT YOUR RESPONSE EXACTLY AS:

REPLY:
<your reply>

SUMMARY:
<updated summary>

RULES:
- Health-related queries only.
- Handle follow-ups like "list them", "what about today/tomorrow".
- No diagnosis or prescriptions.
- Always greet the user by name.
- Keep responses short, clear, and empathetic.
- Do NOT invent or assume dose status.
- You CANNOT mark any dose as taken or missed.
- Do NOT suggest new medicines.
- If unrelated, say:
  "Sorry, I can only help with your medicines and health-related questions."
- Use the provided Current Date only.
- Ensure privacy.
`;

    const aiText = await askGemini(fullPrompt);

    const replyMatch = aiText.match(/REPLY:\s*([\s\S]*?)SUMMARY:/);
    const summaryMatch = aiText.match(/SUMMARY:\s*([\s\S]*)$/);

    const finalReply = replyMatch ? replyMatch[1].trim() : aiText.trim();
    const newSummary = summaryMatch ? summaryMatch[1].trim() : summary;

    return res.json({
      reply: finalReply,
      summary: newSummary
    });

  } catch (err) {
    console.error("Chat handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
