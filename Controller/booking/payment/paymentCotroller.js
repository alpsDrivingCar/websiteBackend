const TimeLessonSchema = require("../../../model/booking/timeLesson/timeLessonSchema");

const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)

exports.payment = async (req, res) => {
// app.post('/create-checkout', async (req, res) => {
    try {
        const paymentIntent = await stripe.checkout.sessions.create({
            // amount, // amount in cents
            // currencycy: 'usd',
            mode: 'payment', // Use 'payment' mode for one-time payments
            success_url: req.body.success_url,
            cancel_url: req.body.cancel_url,
            line_items: req.body.items.map( item => {
                return {
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name :item.name
                        },
                        // unit_amount: item.price
                        unit_amount: "1000"
                    },
                    quantity:item.quantity
                }
            }),
        });

        res.json({url: paymentIntent.url})
    }catch (e) {
        res.status(500).json({error : e.message})
    }
}


