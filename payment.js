require("dotenv").config()
const express = require('express')
const app = express();

app.use(express.json())
const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)
const storeItems = new Map([
        [1, {priceInCents: 1000, name: "alps item "}],
        [2, {priceInCents: 2000, name: "alps item 2 "}],
    ]
)
app.post('/create-checkout', async (req, res) => {
    console.log(req.body);

    try {
        const paymentIntent = await stripe.checkout.sessions.create({
            // amount, // amount in cents
            // currencycy: 'usd',
            mode: 'payment', // Use 'payment' mode for one-time payments
            success_url: `${process.env.SERVER_URL}/success`,
            cancel_url: `${process.env.SERVER_URL}/cancle`,
            line_items: req.body.items.map( item => {
                const  storeItem = storeItems.get(item.id)
                return {
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name :storeItem.name
                        },
                        unit_amount: "59"
                    },
                    quantity:item.quantity
                }
            }),
        });

        res.json({url: paymentIntent.url})
    }catch (e) {
        res.status(500).json({error : e.message})
    }
})

app.post('/success', (req, res) => {
    console.log(req);

})
app.post('/cancle', (req, res) => {
    console.log("success");

})

app.listen(3000, () => {
    console.log("Server Run2 ")
})

