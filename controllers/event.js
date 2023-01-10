import Event from "../models/eventModel.js";
import { calculateAverageRate } from "../utils.js";
import mongoose from "mongoose";

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addEvent = async (req, res) => {
  const data = req.body;

  const newEvent = new Event({
    ...data,
    creator: { _id: req.userId, name: req.username },
    admins: [{ _id: req.userId, name: req.username }],
  });

  try {
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const joinEvent = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Event not found.");

  const existingEvent = await Event.findOne({ _id });

  const ifJoined = existingEvent.participants.find(
    (user) => user._id === req.userId
  );

  if (ifJoined) return res.status(400).send("Already joined.");

  const updatedEvent = await Event.findOneAndUpdate(
    { _id },
    {
      participants: [
        ...existingEvent.participants,
        { _id: req.userId, name: req.username },
      ],
    },
    {
      new: true,
    }
  );
  res.json(updatedEvent);
};

export const leaveEvent = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Event not found.");

  const existingEvent = await Event.findOne({ _id });

  const ifJoined = existingEvent.participants.find(
    (user) => user._id === req.userId
  );

  if (!ifJoined) return res.status(400).send("Join first.");

  const participants = existingEvent.participants.filter(
    (user) => user._id !== req.userId
  );

  const updatedEvent = await Event.findOneAndUpdate(
    { _id },
    { participants },
    {
      new: true,
    }
  );
  res.json(updatedEvent);
};

export const rateEvent = async (req, res) => {
  const { id: _id } = req.params;
  const { rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Event not found.");

  try {
    const existingEvent = await Event.findOne({ _id });
    const rated = existingEvent.rating.rates.find(
      (user) => user._id === req.userId
    );

    if (!rated) {
      const updatedRates = [
        ...existingEvent.rating.rates,
        {
          _id: req.userId,
          rating,
        },
      ];

      // Cast to Number failed for value "NaN" (type number) at path "rating.averag

      const updatedEvent = await Event.findOneAndUpdate(
        { _id },
        {
          rating: {
            rates: updatedRates,
            ratesNumber: updatedRates.length,
            average: calculateAverageRate(updatedRates),
          },
        },
        { new: true }
      );

      res.json(updatedEvent);
    } else {
      res
        .status(400)
        .json({ message: "You already rated this event. Thank you." });
    }
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
