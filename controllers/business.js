import Business from "../models/businessModel.js";
import { calculateAverageRate } from "../utils.js";
import mongoose from "mongoose";

export const getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });

    res.status(200).json(businesses);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const addBusiness = async (req, res) => {
  const data = req.body;

  const newBusiness = new Business({
    ...data,
    creator: { _id: req.userId, name: req.username },
    owners: [{ _id: req.userId, name: req.username }],
  });

  try {
    await newBusiness.save();
    res.status(201).json(newBusiness);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const likeBusiness = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Business not found.");

  const existingBusiness = await Business.findOne({ _id });

  const ifLiked = existingBusiness.likes.find(
    (user) => user._id === req.userId
  );

  if (ifLiked) {
    const likes = existingBusiness.likes.filter(
      (user) => user._id !== req.userId
    );
    const updatedBusiness = await Business.findOneAndUpdate(
      { _id },
      { likes },
      { new: true }
    );
    res.json(updatedBusiness);
  } else {
    const updatedBusiness = await Business.findOneAndUpdate(
      { _id },
      {
        likes: [
          ...existingBusiness.likes,
          { _id: req.userId, name: req.username },
        ],
      },
      { new: true }
    );
    res.json(updatedBusiness);
  }
};

export const deleteBusiness = async (req, res) => {
  const { id: _id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(_id))
      return res.status(404).send("Business not found.");

    await Business.findOneAndRemove({ _id, "creator._id": req.userId });

    res.json(null);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const rateBusiness = async (req, res) => {
  const { id: _id } = req.params;
  const { rating } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("Business not found.");

  try {
    const existingBusiness = await Business.findOne({ _id });
    const rated = existingBusiness.rating.rates.find(
      (user) => user._id === req.userId
    );

    if (!rated) {
      const updatedRates = [
        ...existingBusiness.rating.rates,
        {
          _id: req.userId,
          rating,
        },
      ];

      const updatedBusiness = await Business.findOneAndUpdate(
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
      res.json(updatedBusiness);
    } else {
      res
        .status(400)
        .json({ message: "You already rated this business. Thank you." });
    }
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
