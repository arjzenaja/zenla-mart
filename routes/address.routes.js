const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getAddresses,
  getAddress,
  createAddressHandler,
  updateAddressHandler,
  deleteAddressHandler,
  setDefaultAddressHandler
} = require('../controllers/address.controller');

router.use(authenticate);

router.get('/', getAddresses);
router.get('/:id', getAddress);
router.post('/', createAddressHandler);
router.put('/:id', updateAddressHandler);
router.patch('/:id/set-default', setDefaultAddressHandler);
router.delete('/:id', deleteAddressHandler);

module.exports = router;
