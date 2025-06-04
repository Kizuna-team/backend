const db = require("../db/index.js");
const { activities } = require("../db/schema.js");
const { eq } = require("drizzle-orm");

exports.getAllActivities = async (req, res) => {
  try {
    const result = await db.select().from(activities);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

exports.getActivityById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await db
      .select()
      .from(activities)
      .where(eq(activities.id, id));
    if (result.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

exports.createActivity = async (req, res) => {
  const { title, location, date, description } = req.body;
  console.log(title, location, date, description);
  const createdBy = req.user.id;
  try {
    const [inserted] = await db
      .insert(activities)
      .values({ title, location, date, description, createdBy })
      .returning();
    res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

exports.updateActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  const { title, location, date, description } = req.body;

  try {
    const [updated] = await db
      .update(activities)
      .set({ title, location, date, description, createdBy })
      .where(eq(activities.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};

exports.deleteActivity = async (req, res) => {
  const id = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    const [deleted] = await db
      .delete(activities)
      .where(eq(activities.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "伺服器錯誤，稍後再試" });
  }
};
