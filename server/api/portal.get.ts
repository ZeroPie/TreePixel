import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import Stripe from 'stripe';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const supabase = serverSupabaseClient(event)

    const {data: stripeCustomer} = await supabase.from('profile').select('stripe_customer').eq('id', user?.id).single()
    
    if(stripeCustomer?.stripe_customer) {
        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomer?.stripe_customer,
            return_url: 'https://treepixel-stripe-analytics-main.vercel.app/pricing',
        })

        return {
            url: session.url,
        } 
    }
})