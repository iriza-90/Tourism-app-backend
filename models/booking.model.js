const mongoose = require('mongoose');
const Joi = require('joi');


const travelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  numberOfPeople: { type: Number, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  activitySelection: { type: String, required: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  carRentalPreferences: { type: String },
  specialRequest: { type: String },
  hotelRoomReservation: { type: Boolean, default: false },
  flightReservation: { type: Boolean, default: false },
});


const Travel = mongoose.model('Travel', travelSchema);


const validateTravel = (travel) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    numberOfPeople: Joi.number().integer().min(1).required(),
    checkInDate: Joi.date().required(),
    checkOutDate: Joi.date().required(),
    activitySelection: Joi.string().required(),
    departureCity: Joi.string().required(),
    arrivalCity: Joi.string().required(),
    carRentalPreferences: Joi.string(),
    specialRequest: Joi.string(),
    hotelRoomReservation: Joi.boolean(),
    flightReservation: Joi.boolean(),
  });

  return schema.validate(travel);
};

module.exports = {
  Travel,
  validateTravel,
};
