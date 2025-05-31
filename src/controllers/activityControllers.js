const express = require('express');
const db = require('../db/index.js');
const { activities } = require('../db/schema.js');
const { eq } = require('drizzle-orm');

const router = express.Router();


router.get('/', async (req, res) => {
  try{
    const result = await db.select().from(activities);
    res.json(result);
  }catch(err){
    console.log(err)
    res.status(500).json({ error: '伺服器錯誤，稍後再試' });
  }
});


router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try{
    const result = await db.select().from(activities).where(eq(activities.id, id));
    //console.log(result)
    if (result.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result[0]);
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: '伺服器錯誤，稍後再試' })
  }
});


router.post('/', async (req, res) => {
  const { title, location, date, description, createdBy } = req.body;
  try{
    const [inserted] = await db
    .insert(activities)
    .values({ title, location, date, description, createdBy })
    .returning();//回傳陣列
  //console.log(inserted)
  res.status(201).json(inserted);
  }catch{
    console.log(err)
    res.status(500).json({ error: '伺服器錯誤，稍後再試'})
  }
  
});


router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, location, date, description } = req.body;

  try{
    const [updated] = await db
    .update(activities)
    .set({ title, location, date, description })
    .where(eq(activities.id, id))
    .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(updated);
  }catch(err){
    console.log(err)
    res.status(500).json({ error: '伺服器錯誤，稍後再試'})
  }
  
});


router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const [deleted] = await db
      .delete(activities)
      .where(eq(activities.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err); 
    res.status(500).json({ error: '伺服器錯誤，稍後再試'});
  }
});


module.exports = router;


