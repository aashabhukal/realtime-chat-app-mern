import Conversation from '../models/Conversation.js';

export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    }).populate('participants').sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    console.log("BODY AAYA:", req.body);
    console.log("USER ID:", req.user._id);
    
    const otherId = req.body.participantId || req.body.userId;
    
    if (!otherId) {
      return res.status(400).json({ message: "other user id missing" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherId] }
    });

    if (!conversation) {
      console.log("Nayi conversation bana raha hu");
      conversation = await Conversation.create({
        participants: [req.user._id, otherId]
      });
    }

    conversation = await Conversation.findById(conversation._id).populate('participants');
    res.json(conversation);

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants');
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
