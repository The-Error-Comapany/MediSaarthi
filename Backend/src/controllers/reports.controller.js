import DoseLog from "../DataModels/doselog.model.js";
import mongoose from "mongoose";

export const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const start = new Date(req.query.start);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999); 

    const logs = await DoseLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
      status: { $in: ["taken", "missed"] }
    }).populate("medicationId", "name");

    let taken = 0, missed = 0;
    const daily = {};

    logs.forEach(l => {
      const day = new Date(l.date).toLocaleDateString("en-CA");
      if (!daily[day]) daily[day] = { taken: [], missed: [] };

      if (l.status === "taken") {
        taken++;
        daily[day].taken.push({ name: l.medicationId?.name, time: l.time });
      } else {
        missed++;
        daily[day].missed.push({ name: l.medicationId?.name, time: l.time });
      }
    });

    res.json({ total: { taken, missed }, daily });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Weekly report failed" });
  }
};


export const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const base = new Date(req.query.month);
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);

    const logs = await DoseLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
      status: { $in: ["taken", "missed"] }
    }).populate("medicationId", "name");

    const daily = {};

    logs.forEach(l => {
      const day = new Date(l.date).toLocaleDateString("en-CA");
      if (!daily[day]) daily[day] = { taken: [], missed: [] };
      daily[day][l.status].push({ name: l.medicationId?.name, time: l.time });
    });

    res.json({ daily });

  } catch {
    res.status(500).json({ message: "Monthly report failed" });
  }
};

export const getHistoryReport = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const monthly = await DoseLog.aggregate([
      { $match:{ user:userId, status:{ $in:["taken","missed"] } } },
      {
        $group:{
          _id:{ $dateToString:{ format:"%Y-%m", date:"$date" } },
          taken:{ $sum:{ $cond:[{ $eq:["$status","taken"] },1,0] } },
          missed:{ $sum:{ $cond:[{ $eq:["$status","missed"] },1,0] } }
        }
      },
      { $sort:{ _id:1 } }
    ]);

    const yearly = await DoseLog.aggregate([
      { $match:{ user:userId, status:{ $in:["taken","missed"] } } },
      {
        $group:{
          _id:{ $year:"$date" },
          taken:{ $sum:{ $cond:[{ $eq:["$status","taken"] },1,0] } },
          missed:{ $sum:{ $cond:[{ $eq:["$status","missed"] },1,0] } }
        }
      },
      { $sort:{ _id:1 } }
    ]);

    const monthlyAdherence = {};
    monthly.forEach(m=>{
      const t=m.taken+m.missed;
      monthlyAdherence[m._id]=t?Math.round(m.taken/t*100):0;
    });

    const yearlyAdherence = {};
    yearly.forEach(y=>{
      const t=y.taken+y.missed;
      yearlyAdherence[y._id]=t?Math.round(y.taken/t*100):0;
    });

    res.json({ monthlyAdherence, yearlyAdherence });

  } catch {
    res.status(500).json({ message: "History report failed" });
  }
};