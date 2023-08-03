import Stripe from 'stripe';
import { serverSupabaseClient } from '#supabase/server'

const config = useRuntimeConfig();
const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2022-11-15' });

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const customer = await stripe.customers.create({
    email: body.email,
  })
  const client = serverSupabaseClient(event)
  const updateInfo = [{
    stripe_customer: customer.id
  }]


  const { error } = await client
    .from('profile')
    .update(updateInfo as never)
    .eq('id', body.id)
  if (error)
    alert(error.message)

  return {
    message: `stripe customer created: ${customer.id}`
  }
})