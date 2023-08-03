<script lang="ts" setup>
import { capitalize } from '~/server/api/utils';
import { loadStripe } from '@stripe/stripe-js';

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const is_subscribed = ref<boolean>(false)
const interval = ref<string>('')
const monthlyBilling = ref<boolean>(true)
const loading = ref<boolean>(true)
const showMonthly = ref<boolean>(true)
const cancel_at_period_end = ref<boolean>(false)
const showLoadMoreBillingBtn = ref<boolean>(false)

interface Profile {
  username: string;
  email: string;
  is_subscribed: boolean;
  interval: string;
  current_period_end: Date;
  photo: string;
  cancel_at_period_end: boolean;
}

interface Prices {
  id: string,
  name: string,
  price: number,
  interval: string,
  currency: string
}

const prices = ref<Array<Prices>>([])
const invoices = ref<Array<any> | null>([])

supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'profile' },
    async (payload) => {
      initialize()
    }
  )
  .subscribe()

const clickBillingType = (billingType: boolean) => {
  const monthlyBillingType = document.querySelector('#monthlyBillingType') as HTMLDivElement;
  const yearlyBillingType = document.querySelector('#yearlyBillingType') as HTMLDivElement;
  const proPlan1 = document.querySelector('#s-option') as HTMLDivElement;
  const proPlan2 = document.querySelector('#y-option') as HTMLDivElement;
  if(proPlan1.parentElement && proPlan2.parentElement) {
    if(billingType) {
      showMonthly.value = true
      monthlyBillingType.classList.add('active')
      yearlyBillingType.classList.remove('active')
      proPlan2.parentElement.style.display = 'none'
      proPlan1.parentElement.style.display = 'block'
    } else {
      showMonthly.value = false
      monthlyBillingType.classList.remove('active')
      yearlyBillingType.classList.add('active')
      proPlan2.parentElement.style.display = 'block'
      proPlan1.parentElement.style.display = 'none'
    }
  }
}

const initialize = async() => {
  const { data: profile } = await useAsyncData('profile', async () => {
    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.value?.id)
      .single()
    return data
  })

  if(profile.value) {
    is_subscribed.value = (profile.value as Profile).is_subscribed ? (profile.value as Profile).is_subscribed : false
    interval.value = (profile.value as Profile).interval ? (profile.value as Profile).interval : ""
    cancel_at_period_end.value = (profile.value as Profile).cancel_at_period_end ? (profile.value as Profile).cancel_at_period_end : false
  }
  if(interval.value === 'year') {
    monthlyBilling.value = false
  }
  if(interval.value === 'month') {
    monthlyBilling.value = true
  }
  if(is_subscribed.value == true) {
    const proPlan1 = document.querySelector('#s-option') as HTMLDivElement;
    const proPlan2 = document.querySelector('#y-option') as HTMLDivElement;
    if(monthlyBilling.value) {
      proPlan1.checked = true
    } else {
      proPlan2.checked = true
    }
    clickBillingType(monthlyBilling.value)
  } else {
    const freePlan = document.querySelector('#f-option') as HTMLDivElement;
    freePlan.checked= true;
  }
  loadBilling()
  loading.value = false;
}

const loadPortal = async () => {
  const { data } = await useFetch('/api/portal');
  navigateTo(data.value?.url, { external: true });
}

const loadBilling = async () => {
  const { data } = await useFetch('/api/billing');
  invoices.value = [...data.value?.data as any];
  // if(data.value) {
  //   showLoadMoreBillingBtn.value = data.value.hasMore;
  // }
}

const processSubscription = async () => {
  let planId : String;
  planId = showMonthly.value ? prices.value[0].id : prices.value[1].id;
  const { data: stripeCustomer } = await supabase.from('profile').select('stripe_customer').eq('id', user.value?.id).single()
  const { data } = await useFetch(`/api/subscription/${planId}`, {
    method: 'post',
    body: {
      stripe_customer: stripeCustomer?.stripe_customer
    }
  });

  if (data.value?.id) {
    const stripe = await loadStripe("pk_test_51NToMEGF3QU5haAsIpcl63UK8fffHAYggBZSjGng5gLqf8k3sx1PS13QDZu9b60EdNdIKtuDitD9ZX7nkdzg8NAQ004v1qJCl4");
    await stripe?.redirectToCheckout({ sessionId: data.value?.id });
  }
}

const changePlan = async (isUpdate: boolean) => {
  let planId : String | null = null;
  if(isUpdate == true) {
    planId = showMonthly.value ? prices.value[0].id : prices.value[1].id;
  }
  const { data } = await useFetch('/api/change-plan', {
    method: 'post',
    body: {
      planId: planId
    }
  });
  initialize()
}

const { data: resDataSuccess } = await useFetch('/api/pricing')

prices.value = JSON.parse(JSON.stringify(resDataSuccess.value?.props.sortedPlans, null, 2))

onMounted(async() => {
  const pricingDetailsHeades = document.querySelectorAll('.pricingDetailsHead') as NodeListOf<HTMLDivElement>;

  pricingDetailsHeades.forEach((pricingDetailsHead : HTMLDivElement) => {
    pricingDetailsHead.addEventListener('click', () => {
      const hideDetail = pricingDetailsHead.querySelector('.fa-angle-down') ? true : false
      Array.from(pricingDetailsHead.childNodes)
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .forEach(node => {
        if(hideDetail) {
          node.textContent = 'Less details';
        } else {
          node.textContent = 'Show details';
        }
      });
      if(hideDetail) {
        const iElement = pricingDetailsHead.querySelector('.fa-angle-down')
        if(iElement) {
          iElement.className = 'fal fa-angle-up'
        }
      } else {
        if(pricingDetailsHead.querySelector('.fa-angle-up')) {
          pricingDetailsHead.querySelector('.fa-angle-up')!.className ='fal fa-angle-down'
        }
      }
      if(hideDetail) {
        pricingDetailsHead.previousSibling.style.display = 'block'
      } else {
        pricingDetailsHead.previousSibling.style.display = 'none'
      }
    });
  })
  setTimeout(() => {
    initialize();
  }, 3000)
});
</script>

<template>
  <div class="billingPageSection">
    <div class="container">
      <div class="biilingPageBox">
        <img class="blackLogoImg" src="/images/logo-black.svg" alt="" />
        <div class="titleBiilingBox">
          <a href="/private/dashboard">
            <svg width="24" class="mr12" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_921_7540)">
                <path
                  d="M9.30253 5.71047C9.69253 6.10047 9.69253 6.73047 9.30253 7.12047L5.42253 11.0005H20.5925C21.1425 11.0005 21.5925 11.4505 21.5925 12.0005C21.5925 12.5505 21.1425 13.0005 20.5925 13.0005H5.41253L9.29253 16.8805C9.68253 17.2705 9.68253 17.9005 9.29253 18.2905C8.90253 18.6805 8.27253 18.6805 7.88253 18.2905L2.29253 12.7005C1.90253 12.3105 1.90253 11.6805 2.29253 11.2905L7.89253 5.71047C8.27253 5.32047 8.91253 5.32047 9.30253 5.71047Z"
                  fill="#000000" />
              </g>
              <defs>
                <clipPath id="clip0_921_7540">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
            Back to dashboard
          </a>
          <h2>Billing</h2>
          <p>Manage your billing and plan details.</p>
        </div>
        <div class="currentPlanFreePlanSection">
          <div class="planTitleAndFilterSection d-flex justify-content-between">
            <div class="currentPlantitleBox">
              <h2>Current plan</h2>
              <p>Manage your billing and payment details.</p>
            </div>
            <div class="rightFillter">
              <button id="monthlyBillingType" class="active" type="button" @click="clickBillingType(true)">Monthly billing</button>
              <button id="yearlyBillingType" class="" type="button" @click="clickBillingType(false)">Annual billing <span>Save 20%</span></button>
            </div>
          </div>
          <div class="proAndFreeSection">
            <div class="radio-btns">
              <div class="radio-btn">
                <input type="radio" id="f-option" name="selector" disabled>
                <label for="f-option">
                  <div class="freePlanRadioBox">
                    <div class="radioTitleBox">
                      <h2>Free Plan</h2>
                      <p>Our most popular plan for small teams.</p>
                    </div>
                    <div class="planPriceSection">
                      <h3>$0 <span>per month</span></h3>
                      <p>Includes up to 10 users, 20GB individual data and access to all features.</p>
                    </div>

                  </div>
                </label>
                <div class="showDetailsBox">
                  <div class="pricingDetailsMain">
                    <div class="pricingDetailsDesc font16" style="display: none;">
                      <div class="pricingShowDetailsContent p-3">
                        <div class="pricingPlanContentHead font16 font600">
                          FEATURES
                        </div>
                        <div class="pricingPlanContentDesc font16">
                          Everything in our <span class="font600">free plan</span> plus....
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Access to basic features
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic reporting + analytics
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Up to 10 individual users
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          20GB individual data
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic chat support
                        </div>
                      </div>
                    </div>
                    <div class="pricingDetailsHead position-relative d-flex align-items-center justify-content-center">
                      Show Details
                      <span><i class="fal fa-angle-down"></i></span>
                    </div>
                  </div>
                </div>
                <div class="check"></div>
              </div>
              <div class="radio-btn">
                <input type="radio" id="s-option" name="selector" disabled>
                <label for="s-option">
                  <div class="freePlanRadioBox">
                    <div class="radioTitleBox">
                      <h2>Pro Plan</h2>
                      <p>Advanced features and reporting.</p>
                    </div>
                    <div class="planPriceSection">
                      <h3>$10 <span>per month</span></h3>
                      <p>Includes up to 20 users, 40GB individual data and access to all features.</p>
                    </div>
                  </div>
                </label>
                <div class="showDetailsBox">
                  <div class="pricingDetailsMain">
                    <div class="pricingDetailsDesc font16" style="display: none;">
                      <div class="pricingShowDetailsContent p-3">
                        <div class="pricingPlanContentHead font16 font600">
                          FEATURES
                        </div>
                        <div class="pricingPlanContentDesc font16">
                          Everything in our <span class="font600">free plan</span> plus....
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Access to basic features
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic reporting + analytics
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Up to 10 individual users
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          20GB individual data
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic chat support
                        </div>
                      </div>
                    </div>
                    <div class="pricingDetailsHead position-relative d-flex align-items-center justify-content-center">
                      Show details
                      <span><i class="fal fa-angle-down"></i></span>
                    </div>
                  </div>
                </div>
                <div class="check"></div>
              </div>
              <div class="radio-btn" style="display: none">
                <input type="radio" id="y-option" name="selector" disabled>
                <label for="y-option">
                  <div class="freePlanRadioBox">
                    <div class="radioTitleBox">
                      <h2>Pro Plan</h2>
                      <p>Advanced features and reporting.</p>
                    </div>
                    <div class="planPriceSection">
                      <h3>$35 <span>per year</span></h3>
                      <p>Includes up to 20 users, 40GB individual data and access to all features.</p>
                    </div>
                  </div>
                </label>
                <div class="showDetailsBox">
                  <div class="pricingDetailsMain">
                    <div class="pricingDetailsDesc font16" style="display: none;">
                      <div class="pricingShowDetailsContent p-3">
                        <div class="pricingPlanContentHead font16 font600">
                          FEATURES
                        </div>
                        <div class="pricingPlanContentDesc font16">
                          Everything in our <span class="font600">free plan</span> plus....
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Access to basic features
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic reporting + analytics
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Up to 10 individual users
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          20GB individual data
                        </div>
                        <div class="pricingPlanContentPoints position-relative font16 mb16">
                          <div class="pricingPlanContentImg position-absolute top-0">
                            <img src="/images/pricing-check-icon.svg" alt="">
                          </div>
                          Basic chat support
                        </div>
                      </div>
                    </div>
                    <div class="pricingDetailsHead position-relative d-flex align-items-center justify-content-center">
                      Show details
                      <span><i class="fal fa-angle-down"></i></span>
                    </div>
                  </div>
                </div>
                <div class="check"></div>
              </div>
            </div>
          </div>
          <div class="changePlanCancalPlanText text-right">
            <div v-if="is_subscribed">
              <button v-if="monthlyBilling == showMonthly && cancel_at_period_end" class="cancalBtn" type="button" @click="changePlan(false)">Renew Plan</button>
              <button v-if="monthlyBilling == showMonthly && !cancel_at_period_end" class="cancalBtn" type="button" @click="changePlan(false)">Cancel Plan</button>
              <button v-if="monthlyBilling != showMonthly" class="changePlanBtn" type="button" @click="changePlan(true)">Upgrade to this Plan</button>
            </div>
            <div v-else>
              <button class="changePlanBtn" type="button" @click="processSubscription()">Get start this Pro Plan</button>
            </div>
          </div>
        </div>
        <div class="billingHistoryTableSection">
          <div class="billinghistoryTitle d-flex justify-content-between">
            <h2>Billing history</h2>
            <button type="button"><img src="/images/download-icon.svg" alt="" /> Download all</button>
          </div>
          <div class="billingtable">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th style="text-align: center;">
                      <div class="check-box">
                        <input id="tableCheckBox1" class="filled-in" checked="true" type="checkbox">
                        <label for="tableCheckBox1"></label>
                      </div>
                    </th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="invoice in invoices" :key="invoice">
                    <td style="text-align: center;">
                      <div class="check-box">
                        <input id="tableCheckBox2" class="filled-in" checked="true" type="checkbox">
                        <label for="tableCheckBox2"></label>
                      </div>
                    </td>
                    <td>{{ invoice.number }}</td>
                    <td>{{ invoice.currency.toUpperCase() }} ${{ invoice.amount_due / 100 }}</td>
                    <td>{{ new Date(invoice.created * 1000).toLocaleString('default', {month: 'short'})}} {{ new Date(invoice.created * 1000).getDate() }},{{ new Date(invoice.created * 1000).getFullYear() }}</td>
                    <td><span class="paidTag">{{ invoice.status }}</span></td>
                    <td><a :href="invoice.invoice_pdf"><button class="downBtnBox" type="button"><img src="/images/download-icon.svg" alt="" /></button></a>
                    </td>
                  </tr>
                  <!-- <tr>
                    <td style="text-align: center;">
                      <div class="check-box">
                        <input id="tableCheckBox3" class="filled-in" checked="true" type="checkbox">
                        <label for="tableCheckBox3"></label>
                      </div>
                    </td>
                    <td>Basic Plan – Dec 2022</td>
                    <td>USD $10.00</td>
                    <td>Dec 1, 2022</td>
                    <td><span class="paidTag">Paid</span></td>
                    <td> <button class="downBtnBox" type="button"><img src="/images/download-icon.svg" alt="" /></button>
                    </td>
                  </tr> -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <button v-if="showLoadMoreBillingBtn" class="changePlanBtn ml-32 p-3" type="button" @click="loadBilling()">Load more billing</button>
      </div>
    </div>
  </div>
  <div v-if="loading" class="overlay" id="loadingSpinner">
      <div class="d-flex justify-content-center h-100 align-items-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem; z-index: 20;">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
</template>

<style scoped></style>
