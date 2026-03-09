const User = require('../../models/user/userModel')

const loadCustomer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search?.trim() || "";
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";
    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phoneNumber: { $regex: search, $options: "i" } },
        ],
      }
      : {};

    const totalUsers = await User.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalUsers / limit);


    const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const customers = await User.find(searchFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select("-password");

    return res.render("admin/customers", {
       user: req.session.user || null,
      customers,
      currentPage: page,
      totalPages,
      totalUsers,
      limit,
      search,
      sortField,
      sortOrder,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error("loadCustomer error:", error);
    return res.redirect("/admin/dashboard");
  }
};


const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (customer.isBlocked) {
      return res.status(400).json({ success: false, message: "User is already blocked" });
    }

    customer.isBlocked = true;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: `${customer.fullName} has been blocked successfully`,
    });
  } catch (error) {
    console.error("blockUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await User.findById(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!customer.isBlocked) {
      return res.status(400).json({ success: false, message: "User is not blocked" });
    }

    customer.isBlocked = false;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: `${customer.fullName} has been unblocked successfully`,
    });
  } catch (error) {
    console.error("unblockUser error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  loadCustomer,
  blockUser,
  unblockUser,
};