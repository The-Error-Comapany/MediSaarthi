import { Router } from "express";
import crypto from "crypto";
import axios from "axios";
import CalendarToken from "../DataModels/calendarToken.model.js";

const router = Router();
const stateStore = new Set();

router.get("/auth", (req, res) => {
  const state = crypto.randomBytes(20).toString("hex");
  stateStore.add(state);

  console.log("REDIRECT_URI USED:", process.env.REDIRECT_URI);


  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", process.env.CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", process.env.REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set(
    "scope",
    "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
  );
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", state);

  res.redirect(authUrl.toString());
});

router.get("/oauth2callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!stateStore.has(state)) return res.status(400).send("Invalid state");
    stateStore.delete(state);

    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", process.env.CLIENT_ID);
    params.append("client_secret", process.env.CLIENT_SECRET);
    params.append("redirect_uri", process.env.REDIRECT_URI);
    params.append("grant_type", "authorization_code");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    await CalendarToken.findOneAndUpdate(
      {},
      {
        accessToken: tokenRes.data.access_token,
        refreshToken: tokenRes.data.refresh_token,
        scope: tokenRes.data.scope,
        tokenType: tokenRes.data.token_type,
        expiryDate: Date.now() + tokenRes.data.expires_in * 1000,
      },
      { upsert: true, new: true }
    );


    res.redirect("http://localhost:5173/app/schedule?linked=true");
  } catch (err) {
    res.status(500).send("OAuth failed");
  }
});

router.get("/check", async (req, res) => {
  const linked = await CalendarToken.exists({});
  res.json({ linked: !!linked });
});

router.post("/unlink", async (req, res) => {
  await CalendarToken.deleteMany({});
  res.json({ success: true });
});

export default router;
