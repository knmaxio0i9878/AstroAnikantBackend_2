const visitsModel = require("../models/VisitsModel")
const mailUtil = require("../service/MailUtil")


const createVisit = async (req, res) => {
    const visit = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        birthdate: req.body.birthdate,
        message: req.body.message,
        amount: req.body.amount || 11,
        status: req.body.status || "Pending"
    }
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f9f9f9;">
        <h2 style="color: #9C0B13;">Welcome to Astro Anekant!</h2>
        <p style="color: #333; font-size: 16px;">
          Hello, <strong>${visit.name}</strong>, <br />
          Your consultation booking has been received. 🎉
        </p>
        
        <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #9C0B13;">Booking Details</h3>
          <p><strong>Name:</strong> ${visit.name}</p>
          <p><strong>Phone:</strong> ${visit.phone}</p>
          <p><strong>Email:</strong> ${visit.email}</p>
          <p><strong>Date of Birth:</strong> ${visit.birthdate}</p>
          <p><strong>Consultation Purpose:</strong> ${visit.message}</p>
          <p><strong>Amount:</strong> ₹${visit.amount}</p>
          <p><strong>Status:</strong> ${visit.status}</p>
        </div>
        
        <p style="color: #555; font-size: 15px; margin-top: 15px;">
          Please complete the payment to confirm your booking.
        </p>
        
        <p style="color: #555; font-size: 14px;">
          If you have any questions, feel free to contact us.
        </p>
        <p style="color: #555; font-size: 14px; margin-top: 5px;">
          📧 Email: <strong>astroanekant@gmail.com</strong>
        </p>
        
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
        
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Astro Anekant. All rights reserved.
        </p>
      </div>
    `;
    
    try {
        const response = await visitsModel.create(visit);
        
        if (response) {
            await mailUtil.sendingMail(visit.email, "Consultation Booking Received!", emailBody);
            res.status(200).json({ 
                message: "Visit Added Successfully", 
                data: response 
            });
        } else {
            res.status(400).json({ message: "Failed to Add Visit" });
        }
    } catch (error) {
        console.error("Error creating visit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getAllVisit = async(req,res)=>{
    try {
        const response = await visitsModel.find()
        if (response) {
            res.status(200).json({
                data: response,
                message: "Visit retrieved successfully",
            })
        }
        else {
            res.status(404).json({
                message: "No visit found"
            })
        }
    } catch (error) {
        console.error("Error getting visits:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getSingleVisit = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        
        const visit = await visitsModel.findById(id)
        if (visit) {
            res.status(200).json({
                data: visit,
                message: "visit Fetched Successfully"
            })
        }
        else {
            res.status(404).json({
                message: "visit not Found"
            })
        }
    } catch (error) {
        console.error("Error getting single visit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// NEW CONTROLLER - This is what you're missing!
const updateVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {
            status: req.body.status,
            upiTransactionId: req.body.upiTransactionId
        };
        
        const updatedVisit = await visitsModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }  // Return the updated document
        );
        
        if (!updatedVisit) {
            return res.status(404).json({ message: "Visit not found" });
        }
        
        // Send confirmation email only if status is "Paid"
        if (req.body.status === "Paid") {
            const confirmationEmailBody = `
              <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f9f9f9;">
                <h2 style="color: #9C0B13;">Payment Confirmed! ✅</h2>
                <p style="color: #333; font-size: 16px;">
                  Hello, <strong>${updatedVisit.name}</strong>, <br />
                  Your payment has been received and confirmed. 🎉
                </p>
                
                <div style="background: #fff; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <h3 style="color: #9C0B13;">Consultation Details</h3>
                  <p><strong>Booking ID:</strong> ${updatedVisit._id}</p>
                  <p><strong>Name:</strong> ${updatedVisit.name}</p>
                  <p><strong>Phone:</strong> ${updatedVisit.phone}</p>
                  <p><strong>Email:</strong> ${updatedVisit.email}</p>
                  <p><strong>Date of Birth:</strong> ${updatedVisit.birthdate}</p>
                  <p><strong>Consultation Purpose:</strong> ${updatedVisit.message}</p>
                  <p><strong>Amount Paid:</strong> ₹${updatedVisit.amount}</p>
                  <p><strong>Transaction ID:</strong> ${updatedVisit.upiTransactionId}</p>
                  <p><strong>Status:</strong> <span style="color: green;">Paid</span></p>
                </div>
                
                <p style="color: #555; font-size: 15px; margin-top: 15px;">
                  We will contact you shortly to schedule your consultation.
                </p>
                
                <p style="color: #555; font-size: 14px;">
                  Thank you for choosing Astro Anekant!
                </p>
                <p style="color: #555; font-size: 14px; margin-top: 5px;">
                  📧 Email: <strong>astroanekant@gmail.com</strong>
                </p>
                
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
                
                <p style="color: #999; font-size: 12px;">
                  © ${new Date().getFullYear()} Astro Anekant. All rights reserved.
                </p>
              </div>
            `;
            
            await mailUtil.sendingMail(
                updatedVisit.email,
                "Payment Confirmed - Consultation Booking",
                confirmationEmailBody
            );
        }
        
        res.status(200).json({ 
            message: "Visit Updated Successfully", 
            data: updatedVisit 
        });
        
    } catch (error) {
        console.error("Error updating visit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const deleteVisit = async (req, res) => {
    try {
        const id = req.params.id;
        const deletevisit = await visitsModel.findByIdAndDelete(id)
        if (deletevisit) {
            res.status(200).json({
                data: deletevisit,
                message: 'visit deleted Successfully'
            })
        }
        else {
            res.status(404).json({
                message: 'No such visit found'
            })
        }
    } catch (error) {
        console.error("Error deleting visit:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    createVisit,
    getAllVisit,
    getSingleVisit,
    updateVisit,    // Don't forget to export this!
    deleteVisit
}