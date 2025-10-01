const Donation = require('../models/donation');
const { sendingMail } = require('../service/MailUtil'); // Adjust path as needed

const createDonation = async (req, res) => {
    try {
        const { name, email, phone, amount, paymentMethod = 'upi' } = req.body;

        // Validation
        if (!name || !email || !phone || !amount) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const donation = new Donation({
            name,
            email,
            phone,
            amount,
            paymentMethod,
            donationType: amount <= 11111 ? 'predefined' : 'custom'
        });

        const savedDonation = await donation.save();

        // Send acknowledgment email
        await sendDonationEmail(savedDonation);

        res.status(201).json({
            success: true,
            message: 'Donation recorded successfully',
            data: savedDonation,
            receiptNumber: savedDonation.receiptNumber
        });

    } catch (error) {
        console.error('Donation creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing donation',
            error: error.message
        });
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { donationId } = req.params;
        const { paymentStatus, transactionId, upiTransactionId } = req.body;

        if (!donationId) {
            return res.status(400).json({
                success: false,
                message: 'Donation ID is required'
            });
        }

        const updateData = { 
            paymentStatus
        };

        if (transactionId) updateData.transactionId = transactionId;
        if (upiTransactionId) updateData.upiTransactionId = upiTransactionId;
        if (paymentStatus === 'completed') updateData.completedAt = new Date();

        const donation = await Donation.findByIdAndUpdate(
            donationId,
            updateData,
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Send completion email if payment completed
        if (paymentStatus === 'completed' && !donation.emailSent) {
            await sendCompletionEmail(donation);
            // Update emailSent status
            await Donation.findByIdAndUpdate(donationId, { emailSent: true });
        }

        res.json({
            success: true,
            message: 'Payment status updated successfully',
            data: donation
        });

    } catch (error) {
        console.error('Payment status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment status',
            error: error.message
        });
    }
};

const sendDonationEmail = async (donation) => {
    try {
        const subject = 'Sacred Donation Acknowledgment - Anekant Seva Sansthan';
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
                <div style="background: linear-gradient(135deg, #9C0B13, #dc2626); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: #FEF7D7; margin: 0; font-size: 28px;">🙏 Sacred Donation Acknowledgment 🙏</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Dear <strong style="color: #9C0B13;">${donation.name}</strong>,</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        Thank you for your sacred offering to <strong>Anekant Seva Sansthan</strong>. Your generous contribution supports our spiritual mission and helps us serve humanity with ancient wisdom.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #FEF7D7, #fff8e1); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #9C0B13;">
                        <h3 style="color: #9C0B13; margin-top: 0; font-size: 20px;">📜 Donation Details:</h3>
                        <div style="display: grid; gap: 10px;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Receipt Number:</strong> <span style="color: #9C0B13; font-family: monospace; font-size: 18px;">${donation.receiptNumber}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Amount:</strong> <span style="color: #9C0B13; font-size: 24px; font-weight: bold;">₹${donation.amount.toLocaleString()}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Date:</strong> ${donation.donationDate.toDateString()}</p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Status:</strong> <span style="color: #ea580c; font-weight: bold;">Payment Pending</span></p>
                        </div>
                    </div>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 2px dashed #22c55e; margin: 20px 0;">
                        <h4 style="color: #15803d; margin-top: 0;">💳 Complete Your Payment:</h4>
                        <p style="color: #166534; margin-bottom: 15px;">Please complete your payment using our UPI details:</p>
                        <div style="text-align: center; background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                            <p style="font-size: 24px; font-weight: bold; color: #9C0B13; margin: 10px 0;">yourname@upi</p>
                            <p style="color: #666; margin: 5px 0;">Scan QR code on our donation page</p>
                        </div>
                        <p style="color: #166534; margin-top: 15px; font-size: 14px;"><strong>Important:</strong> After payment, please visit our website to enter your transaction ID for confirmation.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <p style="font-size: 18px; color: #9C0B13; font-style: italic; margin: 0;">
                            "May your generous contribution bring you abundant blessings and spiritual prosperity."
                        </p>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p style="color: #92400e; margin: 0; text-align: center;">
                            <strong>📞 Need Help?</strong><br>
                            Contact us for any assistance with your donation.
                        </p>
                    </div>
                    
                    <div style="border-top: 2px solid #9C0B13; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #9C0B13; font-size: 18px; margin-bottom: 5px;">With Gratitude & Blessings,</p>
                        <p style="color: #666; font-size: 16px; font-weight: bold; margin: 0;">
                            <span style="color: #9C0B13;">अनेकांत सेवा संस्थान</span><br>
                            Anekant Seva Sansthan Team
                        </p>
                    </div>
                </div>
            </div>
        `;

        await sendingMail(donation.email, subject, emailContent);
        console.log(`Acknowledgment email sent to: ${donation.email}`);
        
    } catch (error) {
        console.error('Error sending donation email:', error);
        // Don't throw error as donation was saved successfully
    }
};

const sendCompletionEmail = async (donation) => {
    try {
        const subject = 'Donation Completed - Tax Receipt - Anekant Seva Sansthan';
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
                <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Donation Completed Successfully! 🎉</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Dear <strong style="color: #9C0B13;">${donation.name}</strong>,</p>
                    
                    <p style="font-size: 16px; color: #555; line-height: 1.6;">
                        🙏 Your sacred donation has been received and processed successfully! Thank you for your generous contribution to our spiritual mission.
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 5px solid #22c55e;">
                        <h3 style="color: #15803d; margin-top: 0; font-size: 20px;">🧾 Payment Confirmation:</h3>
                        <div style="display: grid; gap: 10px;">
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Receipt Number:</strong> <span style="color: #9C0B13; font-family: monospace; font-size: 18px;">${donation.receiptNumber}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Amount:</strong> <span style="color: #15803d; font-size: 24px; font-weight: bold;">₹${donation.amount.toLocaleString()}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Transaction ID:</strong> <span style="color: #9C0B13; font-family: monospace;">${donation.transactionId || donation.upiTransactionId || 'Processing...'}</span></p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Payment Date:</strong> ${new Date().toDateString()}</p>
                            <p style="margin: 5px 0; font-size: 16px;"><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">✅ COMPLETED</span></p>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px dashed #f59e0b;">
                        <h4 style="color: #92400e; margin-top: 0;">📋 Tax Receipt Information:</h4>
                        <p style="color: #92400e; margin-bottom: 10px;">This email serves as your official tax receipt. Please keep it for your records.</p>
                        <ul style="color: #92400e; margin: 10px 0; padding-left: 20px;">
                            <li>Valid for income tax deduction under Section 80G</li>
                            <li>Receipt number must be mentioned in ITR filing</li>
                            <li>Keep this email for audit purposes</li>
                        </ul>
                    </div>
                    
                    <div style="background: #ede9fe; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h4 style="color: #7c3aed; margin-top: 0;">🌟 Your Impact:</h4>
                        <p style="color: #6b21a8; margin: 0;">
                            Your contribution supports our mission of spreading ancient wisdom, providing free spiritual guidance to those in need, and maintaining sacred spaces for divine worship. Your generosity helps us serve humanity with devotion.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #FEF7D7, #fff8e1); border-radius: 10px;">
                        <p style="font-size: 20px; color: #9C0B13; font-style: italic; margin: 0; font-weight: bold;">
                            "आपका दान आपको अनंत पुण्य और आशीर्वाद प्रदान करे"
                        </p>
                        <p style="font-size: 16px; color: #666; margin: 10px 0 0 0; font-style: italic;">
                            "May your donation bring you infinite blessings and divine grace"
                        </p>
                    </div>
                    
                    <div style="border-top: 2px solid #22c55e; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #15803d; font-size: 18px; margin-bottom: 5px;">With Heartfelt Gratitude & Divine Blessings,</p>
                        <p style="color: #666; font-size: 16px; font-weight: bold; margin: 0;">
                            <span style="color: #9C0B13;">अनेकांत ज्योतिष एवं वास्तु शोध केंद्र</span><br>
                            <span style="color: #15803d;">Anekant Astrology and Vastu Research Center</span><br>
                            <small style="color: #666;">[Anekant Seva Sansthan]</small>
                        </p>
                    </div>
                </div>
            </div>
        `;

        await sendingMail(donation.email, subject, emailContent);
        console.log(`Completion email sent to: ${donation.email}`);
        
    } catch (error) {
        console.error('Error sending completion email:', error);
        // Don't throw error as payment was processed successfully
    }
};

// Get all donations (admin function)
const getAllDonations = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        
        const query = {};
        if (status) query.paymentStatus = status;
        
        const donations = await Donation.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);
            
        const total = await Donation.countDocuments(query);
        
        res.json({
            success: true,
            data: donations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations',
            error: error.message
        });
    }
};

// Get single donation
const getSingleDonation = async (req, res) => {
    try {
        const { donationId } = req.params;
        
        const donation = await Donation.findById(donationId);
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }
        
        res.json({
            success: true,
            data: donation
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donation',
            error: error.message
        });
    }
};

module.exports = {
    createDonation,
    updatePaymentStatus,
    getAllDonations,
    getSingleDonation
};