import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

// message
export const addMessage = async (req, res) => {
  const messageData = req.body;

  const newMessage = new Message({
    ...messageData,
    sender: req.userId,
  });

  try {
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  const { id: _id } = req.params;

  try {
    const messages = await Message.find({
      conversationId: _id,
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// conversation
export const getConversations = async (req, res) => {
  const { id: _id } = req.params;

  try {
    const conversations = await Conversation.find({
      members: { $in: [_id] },
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getMembersConversation = async (req, res) => {
  const { firstUserId, secondUserId } = req.params;

  try {
    const existingConversation = await Conversation.findOne({
      members: { $all: [firstUserId, secondUserId] },
    });

    if (existingConversation) {
      res.status(200).json(existingConversation);
    } else {
      const newConversation = new Conversation({
        members: [firstUserId, secondUserId],
      });

      await newConversation.save();
      res.status(200).json(newConversation);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

export const addConversation = async (req, res) => {
  const { firstUserId, secondUserId } = req.body;

  const newConversation = new Conversation({
    members: [firstUserId, secondUserId],
  });

  try {
    await newConversation.save();
    res.status(200).json(newConversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
