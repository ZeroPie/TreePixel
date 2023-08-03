import Stripe from 'stripe';

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
    const {data: prices} = await stripe.prices.list();
    const plans = await Promise.all(prices.map(async (price) => {
        const product = await stripe.products.retrieve(price.product as string)
        return {
            id: price.id,
            name: product.name,
            price: price.unit_amount,
            interval: price.recurring?.interval,
            currency: price.currency
        }
    }));

    const sortedPlans = plans.sort((a, b) => {
        if(a.price != null && b.price != null)
            {
                return a.price - b.price
            }
        return 0;
    });

    return {
        props: {
            sortedPlans,
        },
    }
})