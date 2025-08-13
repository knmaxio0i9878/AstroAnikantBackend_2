const bcrypt = require('bcrypt')
const saltRounds = 5


const hashedPassword = async(password)=>{
    const salt = await bcrypt.genSalt(saltRounds)
    const hashPassword = bcrypt.hash(password,salt)
    return hashPassword
}

const comparePassword = async(password,hashedPassword)=>{
    const isMatch = await bcrypt.compare(password,hashedPassword);
    return isMatch;
}
module.exports = {
    hashedPassword,
    comparePassword
}