import connectDb from '../../utils/connectDb'
import User from '../../models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

connectDb()

export default async (req, res) => {
    const { email, password } = req.body
    try {
        // Check if user exists
        const user = await User.findOne({ email }).select('+password')
        // If not, return error
        if(!user) {
            return res.status(404).send("No user exists with that email")
        }
        // Check if password is valid
        const passswordsMatch = await bcrypt.compare(password, user.password)
        // Generate Token
        if(passswordsMatch) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            })
            res.status(200).json(token)
        }
        else {
            res.status(401).send("Passwords do not match")
        }
    }
    catch(error) {
        console.error(error)
        res.status(500).send("Error logging in user")
    }
}