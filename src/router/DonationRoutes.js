const express = require('express');
const router = require("express").Router()
const donation = require('../controller/DonationController');

router.post('/',donation.createDonation);
router.patch('/:donationId/payment-status', donation.updatePaymentStatus);
// router.get('/getalldonations', donation.getAllDonations);
// router.get('/getdonation/:donationId', donation.getDonationById);

module.exports = router;