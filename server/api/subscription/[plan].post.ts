//import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import Stripe from 'stripe';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
    //const supabase = serverSupabaseClient(event)

    const priceId = event.context.params?.plan

    const body = await readBody(event)

    const lineItems = [{
        price: priceId,
        quantity: 1
    }]

    const session = await stripe.checkout.sessions.create({
        customer: body.stripe_customer,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems,
        success_url: `${process.env.CLIENT_URL}/payment/congratulations-page`,
        cancel_url: `${process.env.CLIENT_URL}/private/pricing`,
    })
    
    return {
        id: session.id, 
    }
})