const visitsModel = require("../models/VisitsModel")
const mailUtil = require("../service/MailUtil")


const createVisit = async (req, res) => {
const visit = {
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    birthdate: req.body.birthdate,
    visit_date: req.body.visit_date,
    time: req.body.time,
    message: req.body.message
}
            const emailBody = `
  <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background: #f9f9f9;">
    <h2 style="color: #2E4057;">Welcome to Astro!</h2>
    <p style="color: #333; font-size: 16px;">
      Hello,<strong>${visit.name}</strong>, <br />
      Your Visit has been successfully scheduled on ${visit.visit_date} with Astro at ${visit.time}. 🎉
    </p>

    <br/><br/>
    
    <p><strong>Consultation Purpose:</strong> ${visit.message}</p>

    <p style="color: #555; font-size: 15px; margin-top: 15px;">
      Thanks for choosing Astro.
    </p>
    
        <p style="color: #555; font-size: 14px;">
          If you have any questions, feel free to contact us.
        </p>
        <p style="color: #555; font-size: 14px; margin-top: 5px;">
          📞 Astro Office: <strong>98765 43210</strong>
        </p>
    
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;" />
    
        <p style="color: #999; font-size: 12px;">
          © ${new Date().getFullYear()} Astro. All rights reserved.
        </p>
      </div>
    `;
    
    
    
    const response = await visitsModel.create(visit)    
    if (response) {
        await mailUtil.sendingMail(visit.email,"Success Visit Booked !",emailBody)
        res.status(200).json({ message: "Visit Added Successfully", data: response })
    }
    else {
        res.status(400).json({ message: "Failed to Add Visit" })
    }
}


const getAllVisit = async(req,res)=>{
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
}

const deleteVisit = async (req, res) => {
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
            message: 'No such State found'
        })
    }
}
const getSingleVisit = async (req, res) => {

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
            message: "visit not Fetched Successfully"
        })
    }
}

module.exports ={
    createVisit,
    getAllVisit,
    deleteVisit,
    getSingleVisit
}