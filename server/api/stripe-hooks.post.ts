import Stripe from 'stripe';
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' })
const signingSecret = config.stripeEndpointSecret;

export default defineEventHandler(async (event) => {
    const signature = getRequestHeader(event, "stripe-signature");
    const client = serverSupabaseClient(event);

    if (!signature) {
        throw createError({
            statusCode: 400,
            statusMessage: "Webhook Error: No stripe signature in header",
        });
    }

    const reqBuffer = await readRawBody(event);

    if (!reqBuffer) {
        throw createError({
          statusCode: 400,
          statusMessage: "Webhook Error: No body",
        });
    }

    let eventStripe: Stripe.Event;

    try {
        eventStripe = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
    } catch (error) {
        return {
            error: `Webhook error.${error}`
        }
    }

    let subscription = eventStripe.data.object as Stripe.Subscription;
    let current_period_ends: Date = new Date(
        subscription.current_period_end * 1000
      );
      current_period_ends.setDate(
        current_period_ends.getDate() + config.subscriptionGraceDays
      );
    const {data: userData } = await client.from('profile').select('id').eq('stripe_customer', subscription.customer).single()
    switch(eventStripe.type) {
        case "customer.subscription.updated":
            await client
            .from('profile')
            .update({
                is_subscribed: true,
                interval: subscription.items.data[0].plan.interval,
                current_period_end: new Date(subscription.current_period_end * 1000),
                subscription_id: subscription.id,
                cancel_at_period_end: subscription.cancel_at_period_end,
            } as never)
            .eq('stripe_customer', subscription.customer)
            await client
            .from('website')
            .update({
                available_use: true,
            } as never)
            .eq('user_id', userData?.id)
            break;
        case "customer.subscription.deleted":
            await client
            .from('profile')
            .update({
                is_subscribed: false,
                interval: null,
                current_period_end: new Date(subscription.current_period_end * 1000),
                cancel_at_period_end: subscription.cancel_at_period_end,
            } as never)
            .eq('stripe_customer', subscription.customer)
            if(userData) {
                await client
                .from('website')
                .update({
                    status: false,
                    available_use: false,
                } as never)
                .eq('user_id', userData.id)
                await client
                .from('website')
                .update({
                    status: true,
                    available_use: true,
                } as never)
                .eq('user_id', userData.id)
                .order('id', { ascending: true })
                .limit(1)
            }
            break;
    }

    return {
        received: true
    }
})
