import Stripe from 'stripe';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });
let hasMore = true;
let startingAfter: string | undefined = undefined;
let invoices : any = [];

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const supabase = serverSupabaseClient(event)
    const {data: stripeCustomer} = await supabase.from('profile').select('stripe_customer').eq('id', user?.id).single()
    while (hasMore) {
        const response = await stripe.invoices.list({
            customer: stripeCustomer?.stripe_customer,
            limit: 10,
            starting_after: startingAfter,
        });
        invoices = [...invoices, ...response.data]
        hasMore = response.has_more;
        startingAfter = response.data[response.data.length - 1].id
    }   
    return {
        data: invoices,
        hasMore: hasMore, 
    }
})