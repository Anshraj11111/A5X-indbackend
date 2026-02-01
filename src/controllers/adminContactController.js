import Contact from "../models/Contact.js";

export const getAllContacts = async (req, res) => {
  try {
    const { status, isRead, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (page - 1) * limit;
    
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching contacts",
      error: err.message,
    });
  }
};

export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      contact,
    });
  } catch (err) {
    console.error("❌ Error fetching contact:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching contact",
      error: err.message,
    });
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'viewed', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, isRead: true },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Status updated successfully",
      contact,
    });
  } catch (err) {
    console.error("❌ Error updating status:", err.message);
    res.status(500).json({
      success: false,
      message: "Error updating status",
      error: err.message,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting contact:", err.message);
    res.status(500).json({
      success: false,
      message: "Error deleting contact",
      error: err.message,
    });
  }
};

export const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const viewed = await Contact.countDocuments({ status: 'viewed' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    const unread = await Contact.countDocuments({ isRead: false });

    res.json({
      success: true,
      stats: {
        total,
        new: newContacts,
        viewed,
        replied,
        unread,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err.message);
    res.status(500).json({
      success: false,
      message: "Error fetching stats",
      error: err.message,
    });
  }
};
