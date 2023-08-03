import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { subscribe } from 'diagnostics_channel';
import Stripe from 'stripe';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)
    const supabase = serverSupabaseClient(event)
    const body = await readBody(event)
    const {data: profile} = await supabase.from('profile').select('subscription_id').eq('id', user?.id).single()

    if(profile?.subscription_id) {
        if(body.planId == null) {
            const stripeData = await stripe.subscriptions.retrieve(profile.subscription_id)
            let data;
            if(!stripeData.cancel_at_period_end) {
                data = await stripe.subscriptions.update(profile.subscription_id, { cancel_at_period_end: true, })
            } else {
                data = await stripe.subscriptions.update(profile.subscription_id, { cancel_at_period_end: false, })
            }
            return {
                message: data.current_period_end
            }
        } else {
            const subscription = await stripe.subscriptions.retrieve(profile.subscription_id);
            const currentPlanId = subscription.items.data[0].price.id;
            const currentBillingInterval = subscription.items.data[0].price.recurring?.interval;
            if (currentPlanId === body.planId) {
              console.log('The subscription is already on the desired plan.');
              return {
                message: 'This is already subsribed'
              };
            }
            const updatedItems = [{
              id: subscription.items.data[0].id,
              price: body.planId,
            }];

            const updatedSubscription = await stripe.subscriptions.update(profile.subscription_id, {
              items: updatedItems,
            });
            console.log('change plan')
            return {
                message: 'The plan is updated successfully'
            }
        }
    }
})