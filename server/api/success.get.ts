import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { subscribe } from 'diagnostics_channel';
import Stripe from 'stripe';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const supabase = serverSupabaseClient(event)
    const {data: profile} = await supabase.from('profile').select('subscription_id, interval').eq('id', user?.id).single()
    if(profile?.subscription_id) {
        const stripeData = await stripe.subscriptions.retrieve(profile.subscription_id)
        return {
            current_period_end: stripeData.current_period_end,
            current_period_start: stripeData.current_period_start,
            price: stripeData.items.data[0].plan.amount,
            interval: stripeData.items.data[0].plan.interval,
        }
    }
})