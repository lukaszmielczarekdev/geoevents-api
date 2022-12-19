import Event from "../models/eventModel.js";
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
    creator: { id: req.userId, name: req.username },
    admins: [{ id: req.userId, name: req.username }],
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
