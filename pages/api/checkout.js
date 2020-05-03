import Stripe from 'stripe'
import uuidv4 from 'uuid/v4'
import jwt from 'jsonwebtoken'
import Cart from '../../models/Cart'
import Order from '../../models/Order'
import calculateCartTotal from '../../utils/calculateCartTotal'

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export default async (req, res) => {
    const { paymentData } = req.body
    try {
        // Verify user id
        const { userId } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)
        // Find user's cart
        const cart = await Cart.findOne({ user: userId }).populate({
            path: "products.product",
            model: "Product"
        })
        // Calculate cart totals
        const { cartTotal, stripeTotal } = calculateCartTotal(cart.products)
        // Get email
        const prevCustomer = await stripe.customers.list({
            email: paymentData.email,
            limit: 1
        })
        // Check if existing customer
        const isExistingCustomer = prevCustomer.data.length > 0;
        // Create if not existing
        let newCustomer;
        if(!isExistingCustomer) {
            newCustomer = await stripe.customers.create({
                email: paymentData.email,
                source: paymentData.id
            })
        }
        const customer = (isExistingCustomer && prevCustomer.data[0].id) || newCustomer.id;
        // Create charge
        const charge = await stripe.charges.create({
            currency: "usd",
            amount: stripeTotal,
            receipt_email: paymentData.email,
            customer,
            description: `Checkout | ${paymentData.email} | ${paymentData.id}`
        }, {
            idempotency_key: uuidv4()
        })
        // Add order to DB
        await new Order({
            user: userId,
            email: paymentData.email,
            total: cartTotal,
            products: cart.products
        }).save()
        // Clear cart
        await Cart.findOneAndUpdate(
            { _id: cart._id },
            { $set: { products: [] } }
        )
        res.status(200).send("Checkout successfull")
    }
    catch(error) {
        console.error(error)
        res.status(500).send("Error processing charge")
    }
}