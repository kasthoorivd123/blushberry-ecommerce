const Address = require('../../models/user/addressModel')

// ─────────────────────────────────────────────
// GET /addresses
// ─────────────────────────────────────────────
const loadAddresses = async (req, res) => {
  try {
    const userId   = req.session.user._id
    const addresses = await Address.find({ user: userId }).sort({ createdAt: -1 })
    return res.render('user/addresses', { addresses })
  } catch (error) {
    console.error('loadAddresses error:', error)
    return res.redirect('/profile')
  }
}

// ─────────────────────────────────────────────
// GET /addresses/add
// ─────────────────────────────────────────────
const loadAddAddress = (req, res) => {
  return res.render('user/addresses', { errorMsg: null, successMsg: null })
}

// ─────────────────────────────────────────────
// POST /addresses/add
// ─────────────────────────────────────────────
const addAddress = async (req, res) => {
  try {
    const userId = req.session.user._id

    const {
      name, country, state, address, city,
      pincode, addressType, landmark,
      mobile, email, alternateNumber,
    } = req.body

    if (!name || !country || !state || !address || !pincode || !mobile || !email) {
      return res.render('user/addresses', {
        errorMsg  : 'Please fill in all required fields',
        successMsg: null,
      })
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.render('user/addresses', {
        errorMsg  : 'Pin code must be a 6-digit number',
        successMsg: null,
      })
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.render('user/addresses', {
        errorMsg  : 'Mobile number must be 10 digits',
        successMsg: null,
      })
    }

    const newAddress = new Address({
      user            : userId,
      name,
      country,
      state,
      address,
      city            : city            || null,
      pincode,
      addressType     : addressType     || 'Home',
      landmark        : landmark        || null,
      mobile,
      email,
      alternateNumber : alternateNumber || null,
    })

    await newAddress.save()

    // ✅ redirect to profile with success message
    return res.redirect('/profile?success=Address added successfully')

  } catch (error) {
    console.error('addAddress error:', error)
    return res.render('user/addresses', {
      errorMsg  : 'Something went wrong. Please try again.',
      successMsg: null,
    })
  }
}

// ─────────────────────────────────────────────
// GET /addresses/edit/:id
// ─────────────────────────────────────────────
const loadEditAddress = async (req, res) => {
  try {
    const userId    = req.session.user._id
    const addressId = req.params.id

    const address = await Address.findOne({ _id: addressId, user: userId })
    if (!address) return res.redirect('/addresses')

    return res.render('user/addresses', { address, errorMsg: null })
  } catch (error) {
    console.error('loadEditAddress error:', error)
    return res.redirect('/addresses')
  }
}

// ─────────────────────────────────────────────
// POST /addresses/edit/:id
// ─────────────────────────────────────────────
const editAddress = async (req, res) => {
  try {
    const userId    = req.session.user._id
    const addressId = req.params.id

    const {
      name, country, state, address, city,
      pincode, addressType, landmark,
      mobile, email, alternateNumber,
    } = req.body

    if (!name || !country || !state || !address || !pincode || !mobile || !email) {
      const existing = await Address.findById(addressId)
      return res.render('user/addresses', {
        address  : existing,
        errorMsg : 'Please fill in all required fields',
      })
    }

    await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      {
        name, country, state, address,
        city            : city            || null,
        pincode,
        addressType     : addressType     || 'Home',
        landmark        : landmark        || null,
        mobile, email,
        alternateNumber : alternateNumber || null,
      },
      { new: true }
    )

    return res.redirect('/profile?success=Address updated successfully')
  } catch (error) {
    console.error('editAddress error:', error)
    return res.redirect('/addresses')
  }
}

// ─────────────────────────────────────────────
// POST /addresses/delete/:id
// ─────────────────────────────────────────────
const deleteAddress = async (req, res) => {
  try {
    const userId    = req.session.user._id
    const addressId = req.params.id

    await Address.findOneAndDelete({ _id: addressId, user: userId })

    return res.redirect('/profile?success=Address deleted successfully')
  } catch (error) {
    console.error('deleteAddress error:', error)
    return res.redirect('/addresses')
  }
}

// ─────────────────────────────────────────────
// POST /addresses/default/:id
// ─────────────────────────────────────────────
const setDefaultAddress = async (req, res) => {
  try {
    const userId    = req.session.user._id
    const addressId = req.params.id

    await Address.updateMany({ user: userId }, { isDefault: false })
    await Address.findOneAndUpdate(
      { _id: addressId, user: userId },
      { isDefault: true }
    )

    return res.redirect('/profile?success=Default address updated')
  } catch (error) {
    console.error('setDefaultAddress error:', error)
    return res.redirect('/addresses')
  }
}

module.exports = {
  loadAddresses,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  setDefaultAddress,
}