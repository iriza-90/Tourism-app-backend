const express = require('express');
const router = express.Router();
const { Travel, validateTravel } = require('../models/booking.model');
const authorize = require('../middleware/authorize');

// POST route to add new travel data to the database 
// authorize middleware is used to check if the user is logged in or not
router.post('/', authorize, async (req, res) => {
    try {
      const { error } = validateTravel(req.body);
      if (error) {
        return res.status(400).send({ message: error.details[0].message });
      }
  
      const newTravel = new Travel(req.body);
      await newTravel.save();
  
      res.status(201).send({ message: 'Travel data saved successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

// GET route to fetch all travel data from the database
router.get('/', async (req, res) => {
  try {
    const travelData = await Travel.find();
    return res.status(200).send(travelData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

module.exports = router;
