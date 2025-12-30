import axios from "axios";
import CalendarToken from "../DataModels/calendarToken.model.js";
export const getValidAccessToken = async () => {
  try {
    const tokenDoc = await CalendarToken.findOne();
    if (!tokenDoc) return null;

    let accessToken = tokenDoc.accessToken;

    try {
      await axios.get(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return accessToken;
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error("Calendar check failed:", err.message);
        return null;
      }

      const params = new URLSearchParams();
      params.append("client_id", process.env.CLIENT_ID);
      params.append("client_secret", process.env.CLIENT_SECRET);
      params.append("refresh_token", tokenDoc.refreshToken);
      params.append("grant_type", "refresh_token");

      const res = await axios.post(
        "https://oauth2.googleapis.com/token",
        params.toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      tokenDoc.accessToken = res.data.access_token;
      tokenDoc.tokenType = res.data.token_type;
      tokenDoc.expiryDate = res.data.expiry_date;
      await tokenDoc.save();

      return tokenDoc.accessToken;
    }
  } catch (err) {
    console.error("getValidAccessToken fatal error:", err.message);
    return null; 
  }
};


export const createMedicineEvents = async ({
  accessToken,
  name,
  dosage,
  description,
  times,
  startDate,
  endDate,
}) => {
  const createdEvents = [];

  if (accessToken) {
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0];

      for (const time of times) {
        const startDateTime = new Date(`${dateString}T${time}:00+05:30`);
        const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

        const event = {
          summary: `💊 ${name} (${dosage})`,
          description: description || "Medicine reminder",
          start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Kolkata" },
          end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Kolkata" },
          reminders: { useDefault: true },
        };

        try {
          const res = await axios.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            event,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          createdEvents.push(res.data.id);
        } catch (err) {
          console.error("Calendar error:", err?.response?.data || err.message);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return createdEvents;
};

export const deleteMedicineEvents = async (accessToken, eventIds = []) => {
  if (accessToken && eventIds.length) {
    for (const eventId of eventIds) {
      try {
        await axios.delete(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch (err) {
        console.error("Failed to delete event:", err?.response?.data || err.message);
      }
    }
  }
};
