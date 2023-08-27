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
app.post('/ccs', async (req, res) => {
    console.log(req.body);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            // amount: 1000, // amount in cents
            // currency: 'usd',
            line_items:req.body.items.map( item =>{
                const  storeItem = storeItems.get(item.id)
                return {
                    price_data:{
                        currency: 'usd',
                        product_data:{
                            name :storeItem.name
                        },
                        unit_amount: storeItem.priceInCents
                    },
                    quantity:item.quantity
                }
            }),
            payment_method_types: ['card'],
            mode: 'payment',
            success_url:`https://www.youtube.com/watch?v=1r-F3FIONl8`,
            cancel_url:'https://www.youtube.com/watch?v=1r-F3FIONl8'
        });

        res.json({data:'hi'})
    }catch (e) {
        res.status(500).json({error : e.message})
    }
})

app.post('/success', (req, res) => {
    console.log("success");

})
app.post('/cancle', (req, res) => {
    console.log("success");

})

app.listen(3000, () => {
    console.log("Server Run2 ")
})
