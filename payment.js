require("dotenv").config()
const express = require('express')
const app = express();

app.use(express.json())
const stripe = require('stripe')(
    process.env.STRIPE_PRIVATE_KEY
)

app.post('/create-checkout', async (req, res) => {
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
                        unit_amount: item.price
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

// app.listen(3000, () => {
//     console.log("Server Run2 ")
// })



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


//mongoose

// app.listen(3000)
app.listen(process.env.PORT || 3000, () => {
    console.log("Server Run ")
})

module.exports = app
