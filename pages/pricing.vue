<script lang="ts" setup>
import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js';

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const supabaseAuth = useSupabaseAuthClient()
const showSubscribeButton = ref<boolean>(false)
const signoutLoading = ref<boolean>(false)
const showCreateAccountButton = ref<boolean>(false)
const showManageSubscriptionButton = ref<boolean>(false)
const intervalInfo = ref<string>('')

const monthlyBillingPlan = ref<boolean>(true)

interface ProfileInfo {
  is_subscribed: boolean;
  interval: string;
}

interface Prices {
  id: string,
  name: string,
  price: number,
  interval: string,
  currency: string
}

const signOut = async () => {
  try {
    signoutLoading.value = true
    let { error } = await supabaseAuth.auth.signOut()
    if (error) throw error
    localStorage.removeItem('credentials');
    navigateTo('/')
  } catch (error) {
    alert(error)
  } finally {
    signoutLoading.value = false
  }
}

const { data: profileInfo } = await useAsyncData('profileInfo', async () => {
  if (user) {
    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.value?.id)
      .single()
    return data;
  }
});
if (profileInfo.value) {
  showSubscribeButton.value = !!profileInfo.value && !(profileInfo.value as ProfileInfo).is_subscribed
  showManageSubscriptionButton.value = !!profileInfo.value && (profileInfo.value as ProfileInfo).is_subscribed
  intervalInfo.value = (profileInfo.value as ProfileInfo).interval
}

const processSubscription = async (planId: any) => {
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

const loadPortal = async () => {
  const { data } = await useFetch('/api/portal');
  navigateTo(data.value?.url, { external: true });
}

const prices = ref<Array<Prices>>([])
const { data: resDataSuccess } = await useFetch('/api/pricing')

prices.value = JSON.parse(JSON.stringify(resDataSuccess.value?.props.sortedPlans, null, 2))

const clickGetStared = async (plan: string | null) => {
  const {data: userInfo} = await supabase.auth.getUser()
  if(userInfo.user) {
    if(plan != null) {
      processSubscription(plan)
    } else {
      navigateTo('private/dashboard')
    }
  } else {
    navigateTo('auth/log-in')
  }
}

onMounted(() => {
  const monthlyBilling: HTMLDivElement | null = document.querySelector('#monthlyBilling');
  const yearlyBilling: HTMLDivElement | null = document.querySelector('#yearlyBilling');
  if (monthlyBilling && yearlyBilling) {
    monthlyBilling.addEventListener('click', () => {
      monthlyBilling.classList.add('active');
      yearlyBilling.classList.remove('active');
      monthlyBillingPlan.value = true;
    });
    yearlyBilling.addEventListener('click', () => {
      yearlyBilling.classList.add('active');
      monthlyBilling.classList.remove('active');
      monthlyBillingPlan.value = false;
    });
  }

const faqQuestions = document.querySelectorAll('.faqQuestionPrice');

faqQuestions.forEach(faqQuestion => {
  faqQuestion.addEventListener('click', () => {
    const faqAnswer = faqQuestion.nextElementSibling as HTMLElement;
    const faqParent = faqQuestion.parentElement;
    if(faqQuestion) {
      faqQuestion.classList.toggle('active');
    }

    if(faqAnswer) {
      if(faqAnswer.style.display == 'block') {
        faqAnswer.style.display = 'none'
      } else {
        faqAnswer.style.display = 'block'
      }
    }
  });
});
})
</script>

<template>
  <div class="headBannerSection">
    <div class="headerMain">
      <div class="container">
        <div class="headerBox">
          <a href="/">
            <img src="/images/logo.svg" alt="" />
          </a>
          <div class="menuIcon">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div class="sweplyMenu respoMenu">
            <div class="d-flex align-items-center justify-content-between">
              <div class="">
                <a href="/">
                  <img src="/images/logo-black.svg" width="150px" alt="" />
                </a>
              </div>
              <div class="closeMenu">
                <span></span>
                <span></span>
              </div>
            </div>
            <ul>
              <li><a href="/"> Home </a></li>
              <li><a href="/private/dashboard">Dashboard</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a target="_blank" href="https://sweply.com/">Discover Sweply</a></li>
              <li v-if=user><a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut">
                  {{ signoutLoading ? 'Loading' : 'Log out' }}
                </a></li>
              <li v-else><a href="/auth/log-in"> Log in </a></li>
            </ul>
          </div>

          <div class="sweplyMenu respoHide">
            <ul>
              <li><a href="/"> Home </a></li>
              <li><a href="/private/dashboard">Dashboard</a></li>
              <li><a href="/pricing">Pricing</a></li>
              <li><a target="_blank" href="https://sweply.com/">Discover Sweply</a></li>
            </ul>
          </div>
          <div class="sweplyRightMenu respoHide">
            <ul v-if=user>
              <li class="pointer"><a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut" class="claimBtn">
                  {{ signoutLoading ? 'Loading' : 'Log out' }}
                </a></li>
            </ul>
            <ul v-else>
              <li class="pointer"><a href="/auth/log-in" class="claimBtn mr-3"> Log in </a></li>
              <li class="pointer"><a href="/auth/sign-up" class="claimBtn"> Create link for free </a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="pricingSectionMain">
    <div class="container">
      <div class="pricingSectionName font16 font600">
        Pricing
      </div>
      <div class="pricingSectionHead">
        Simple, transparent pricing
      </div>
      <div class="pricingSectionDesc">
        We believe Untitled should be accessible to all companies, no matter the size.
      </div>
      <div class="pricingSectionTabs rounded-3 d-flex justify-content-center align-items-center">
        <div id="monthlyBilling" class="pricingTabs rounded-3 font16 font600 active mr8 ml24">
          Monthly&nbsp;&nbsp;billing
        </div>
        <div id="yearlyBilling" class="pricingTabs rounded-3 font16 font600 mr8">
          Annual&nbsp;billing&nbsp;<span class="font500 font16">Save&nbsp;20%</span>
        </div>
      </div>
      <div v-if="monthlyBillingPlan" class="d-flex align-items-center pricingPlanFlexSection">
        <div class="w-50 pricingPlanList mr32">
          <div class="d-flex justify-content-between align-items-center pricingPlanHeadingMain">
            <div class="pricingPlanHeading">
              <div class="pricingPlanHead">
                Free Plan
              </div>
              <div class="pricingPlanDesc font16">
                Our most popular plan for small teams.
              </div>
            </div>
            <div class="pricingPlanPrice">
              <sup>$</sup>0<sub>per month</sub>
            </div>
          </div>
          <div class="pricingPlanContent">
            <div class="pricingPlanContentHead font16 font600">
              FEATURES
            </div>
            <div class="pricingPlanContentDesc font16">
              Everything in our <span class="font600">free plan</span> plus....
            </div>
            <div class="row">
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Access to basic features
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Attend events
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic reporting + analytics
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Automatic updates
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Up to 10 individual users
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Backup your account
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  20GB individual data
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Audit log and notes
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic chat support
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Feature requests
                </div>
              </div>
            </div>
          </div>
          <div class="planGetStartMain">
            <a v-if="!showManageSubscriptionButton" class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="clickGetStared(null)">Get started</a>
            <a v-else class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="loadPortal()">Change Plan</a>
          </div>
        </div>
        <div class="w-50 pricingPlanList">
          <div class="d-flex justify-content-between align-items-center pricingPlanHeadingMain">
            <div class="pricingPlanHeading">
              <div class="pricingPlanHead">
                {{ prices[0].name }} <span class="font500 rounded-4">Recommended</span>
              </div>
              <div class="pricingPlanDesc font16">
                Advanced features and reporting.
              </div>
            </div>
            <div class="pricingPlanPrice">
              <sup>$</sup>{{ prices[0].price / 100 }}<sub>per month</sub>
            </div>
          </div>
          <div class="pricingPlanContent">
            <div class="pricingPlanContentHead font16 font600">
              FEATURES
            </div>
            <div class="pricingPlanContentDesc font16">
              Everything in our <span class="font600">free plan</span> plus....
            </div>
            <div class="row">
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Access to basic features
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Attend events
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic reporting + analytics
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Automatic updates
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Up to 10 individual users
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Backup your account
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  20GB individual data
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Audit log and notes
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic chat support
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Feature requests
                </div>
              </div>
            </div>
          </div>
          <div class="planGetStartMain">
            <a v-if="!showManageSubscriptionButton" class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="clickGetStared(prices[0].id)">Get started</a>
            <a v-else class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="loadPortal()">{{ intervalInfo === 'year' ? 'Change Plan' : 'Management Subscription'}}</a>
          </div>
        </div>
      </div>
      <div v-if="!monthlyBillingPlan" class="d-flex align-items-center pricingPlanFlexSection">
        <div class="w-50 pricingPlanList mr32">
          <div class="d-flex justify-content-between align-items-center pricingPlanHeadingMain">
            <div class="pricingPlanHeading">
              <div class="pricingPlanHead">
                Free Plan
              </div>
              <div class="pricingPlanDesc font16">
                Our most popular plan for small teams.
              </div>
            </div>
            <div class="pricingPlanPrice">
              <sup>$</sup>0<sub>per year</sub>
            </div>
          </div>
          <div class="pricingPlanContent">
            <div class="pricingPlanContentHead font16 font600">
              FEATURES
            </div>
            <div class="pricingPlanContentDesc font16">
              Everything in our <span class="font600">free plan</span> plus....
            </div>
            <div class="row">
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Access to basic features
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Attend events
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic reporting + analytics
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Automatic updates
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Up to 10 individual users
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Backup your account
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  20GB individual data
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Audit log and notes
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic chat support
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Feature requests
                </div>
              </div>
            </div>
          </div>
          <div class="planGetStartMain">
            <a v-if="!showManageSubscriptionButton" class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="clickGetStared(null)">Get started</a>
            <a v-else class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="loadPortal()">Change Plan</a>
          </div>
        </div>
        <div class="w-50 pricingPlanList">
          <div class="d-flex justify-content-between align-items-center pricingPlanHeadingMain">
            <div class="pricingPlanHeading">
              <div class="pricingPlanHead">
                {{ prices[1].name }} <span class="font500 rounded-4">Recommended</span>
              </div>
              <div class="pricingPlanDesc font16">
                Advanced features and reporting.
              </div>
            </div>
            <div class="pricingPlanPrice">
              <sup>$</sup>{{ prices[1].price /100 }}<sub>per year</sub>
            </div>
          </div>
          <div class="pricingPlanContent">
            <div class="pricingPlanContentHead font16 font600">
              FEATURES
            </div>
            <div class="pricingPlanContentDesc font16">
              Everything in our <span class="font600">free plan</span> plus....
            </div>
            <div class="row">
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Access to basic features
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Attend events
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic reporting + analytics
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Automatic updates
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Up to 10 individual users
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Backup your account
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  20GB individual data
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Audit log and notes
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Basic chat support
                </div>
              </div>
              <div class="col-sm-6 col-md-6 col-lg-6">
                <div class="pricingPlanContentPoints position-relative font16 mb16">
                  <div class="pricingPlanContentImg position-absolute top-0">
                    <img src="/images/pricing-check-icon.svg" alt="" />
                  </div>
                  Feature requests
                </div>
              </div>
            </div>
          </div>
          <div class="planGetStartMain">
            <a v-if="!showManageSubscriptionButton" class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="clickGetStared(prices[1].id)">Get started</a>
            <a v-else class="planGetStartMainBtn rounded-3 w-100 font16 font600 d-block text-center" @click="loadPortal()">{{ intervalInfo === 'month' ? 'Change Plan' : 'Management Subscription'}}</a>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="faqSectionMainPricing d-flex align-items-start">
          <div class="faqHeadingSectionPricing">
            <div class="faqSupportHeadPricing">
              Support
            </div>
            <div class="faqHeadPricing font600 text-white">
              FAQs
            </div>
            <div class="faqDescPricing">
              Everything you need to know about the product and billing. Can’t find the answer you’re looking for? Please
              chat to our friendly team.
            </div>
          </div>
          <div class="faqQuestionMainPrice">
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative active">
                Is there a free trial available?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: block;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative">
                Can I change my plan later?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: none;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative">
                What is your cancellation policy?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: none;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative">
                Can other info be added to an invoice?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: none;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative">
                How does billing work?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: none;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
            <div class="faqQuestionAnsPrice">
              <div class="faqQuestionPrice text-white position-relative">
                How do I change my account email?
                <span class="position-absolute questionPlus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="position-absolute questionMinus">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                      stroke="#98A2B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
              <div class="faqAnsPrice font16" style="display: none;">
                Yes, you can try us for free for 30 days. If you want, we’ll provide you with a free, personalized
                30-minute onboarding call to get you up and running as soon as possible.
              </div>
            </div>
          </div>
        </div>
        <div class="stillQuestionMain d-flex justify-content-between align-items-center rounded-4">
          <div class="stillQuestion">
            <div class="stillQuestionHead font600">
              Still have questions?
            </div>
            <div class="stillQuestionDesc">
              Can’t find the answer you’re looking for? Please chat to our friendly team.
            </div>
          </div>
          <div class="btnStillQuestion">
            <a class="claimBtn">Get in touch</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="footerSection">
    <div class="container">
      <div class="footerFirstSection">
        <div class="footerLeftBox">
          <img src="/images/logo.svg" alt="" />
          <p class="mb0">Powered by Sweply</p>
        </div>
        <div class="footerRightMenuBox">
          <ul>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Sweply Ads</a></li>
            <li><a href="#">Sweply Plus</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
      </div>
      <div class="footer2ndBox">
        <p>© 2023 Treepixel. All rights reserved.</p>
        <div class="footerSocialBox">
          <ul>
            <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.55016 21.75C16.6045 21.75 21.5583 14.2468 21.5583 7.74192C21.5583 7.53098 21.5536 7.31536 21.5442 7.10442C22.5079 6.40752 23.3395 5.54432 24 4.55536C23.1025 4.95466 22.1496 5.21544 21.1739 5.3288C22.2013 4.71297 22.9705 3.74553 23.3391 2.60583C22.3726 3.17862 21.3156 3.58267 20.2134 3.80067C19.4708 3.01162 18.489 2.48918 17.4197 2.31411C16.3504 2.13905 15.2532 2.32111 14.2977 2.83216C13.3423 3.3432 12.5818 4.15477 12.1338 5.14137C11.6859 6.12798 11.5754 7.23468 11.8195 8.29036C9.86249 8.19215 7.94794 7.68377 6.19998 6.79816C4.45203 5.91255 2.90969 4.6695 1.67297 3.14958C1.0444 4.2333 0.852057 5.51571 1.13503 6.73615C1.418 7.9566 2.15506 9.02351 3.19641 9.72005C2.41463 9.69523 1.64998 9.48474 0.965625 9.10598V9.16692C0.964925 10.3042 1.3581 11.4066 2.07831 12.2868C2.79852 13.167 3.80132 13.7706 4.91625 13.995C4.19206 14.1932 3.43198 14.2221 2.69484 14.0794C3.00945 15.0575 3.62157 15.913 4.44577 16.5264C5.26997 17.1398 6.26512 17.4807 7.29234 17.5013C5.54842 18.8712 3.39417 19.6142 1.17656 19.6107C0.783287 19.6101 0.390399 19.586 0 19.5385C2.25286 20.9838 4.87353 21.7514 7.55016 21.75Z"
                    fill="#8C94A3" />
                </svg>
              </a> </li>
            <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_426_456)">
                    <path
                      d="M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z"
                      fill="#8C94A3" />
                  </g>
                  <defs>
                    <clipPath id="clip0_426_456">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a> </li>
            <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_426_459)">
                    <path
                      d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.3882 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z"
                      fill="#8C94A3" />
                  </g>
                  <defs>
                    <clipPath id="clip0_426_459">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </a> </li>
            <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_426_461)">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M12 0C5.3724 0 0 5.3808 0 12.0204C0 17.3304 3.438 21.8364 8.2068 23.4252C8.8068 23.5356 9.0252 23.1648 9.0252 22.8456C9.0252 22.5612 9.0156 21.804 9.0096 20.802C5.6712 21.528 4.9668 19.1904 4.9668 19.1904C4.422 17.8008 3.6348 17.4312 3.6348 17.4312C2.5452 16.6872 3.7176 16.7016 3.7176 16.7016C4.9212 16.7856 5.5548 17.94 5.5548 17.94C6.6252 19.776 8.364 19.2456 9.0468 18.9384C9.1572 18.162 9.4668 17.6328 9.81 17.3328C7.146 17.0292 4.344 15.9972 4.344 11.3916C4.344 10.08 4.812 9.006 5.5788 8.166C5.4552 7.8624 5.0436 6.6396 5.6964 4.986C5.6964 4.986 6.7044 4.662 8.9964 6.2172C9.97532 5.95022 10.9853 5.81423 12 5.8128C13.02 5.8176 14.046 5.9508 15.0048 6.2172C17.2956 4.662 18.3012 4.9848 18.3012 4.9848C18.9564 6.6396 18.5436 7.8624 18.4212 8.166C19.1892 9.006 19.6548 10.08 19.6548 11.3916C19.6548 16.0092 16.848 17.0256 14.1756 17.3232C14.6064 17.694 14.9892 18.4272 14.9892 19.5492C14.9892 21.1548 14.9748 22.452 14.9748 22.8456C14.9748 23.1672 15.1908 23.5416 15.8004 23.424C18.19 22.6225 20.2672 21.0904 21.7386 19.0441C23.2099 16.9977 24.001 14.5408 24 12.0204C24 5.3808 18.6264 0 12 0Z"
                      fill="#8C94A3" />
                  </g>
                  <defs>
                    <clipPath id="clip0_426_461">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
            </a> </li>
          <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M17.7703 10.0969C18.3188 8.56875 19.8985 4.14844 19.8985 2.73281C19.8985 1.48594 19.1625 0.440625 17.85 0.440625C15.7594 0.440625 13.8844 6.61406 13.2985 8.08594C12.8438 6.75 10.7156 0 8.84064 0C7.38283 0 6.69846 1.07344 6.69846 2.42344C6.69846 4.07812 8.30158 8.36719 8.88283 10.0172C8.58752 9.90938 8.26877 9.81562 7.94533 9.81562C6.84845 9.81562 5.68127 11.1797 5.68127 12.2812C5.68127 12.6984 5.91095 13.2844 6.05627 13.6734C4.32658 14.1422 3.66095 15.2953 3.66095 17.0344C3.65627 20.4187 6.86252 24 11.3719 24C16.9031 24 20.3438 19.8469 20.3438 14.4891C20.3438 12.4688 20.0203 10.6453 17.7703 10.0969ZM16.111 5.0625C16.2985 4.48594 17.1 2.04844 17.85 2.04844C18.2531 2.04844 18.361 2.46563 18.361 2.79844C18.361 3.69375 16.5516 8.63906 16.1531 9.73594L14.5594 9.45469L16.111 5.0625ZM8.17033 2.26406C8.17033 1.70625 8.85002 0.121875 10.3406 4.47188L11.9625 9.17344C11.2313 9.1125 10.6641 9.03281 10.3031 9.23906C9.79221 7.88906 8.17033 3.62812 8.17033 2.26406ZM8.06252 11.4375C9.43596 11.4375 11.2078 15.8719 11.2078 16.4719C11.2078 16.7109 10.9781 17.0062 10.711 17.0062C9.73127 17.0062 7.10627 13.4016 7.10627 12.4266C7.11095 12.0656 7.70158 11.4375 8.06252 11.4375ZM16.7016 20.1703C15.3375 21.6703 13.5938 22.4484 11.5594 22.4484C8.77502 22.4484 6.57658 20.9203 5.5172 18.3094C4.71564 16.275 5.69533 15.1078 6.48283 15.1078C7.01721 15.1078 9.02814 17.9344 9.02814 18.5344C9.02814 18.7641 8.6672 18.9234 8.4797 18.9234C7.72502 18.9234 7.42971 18.1969 6.08439 16.5141C4.69221 17.9062 7.04533 20.5875 8.81721 20.5875C10.0406 20.5875 10.8375 19.4531 10.5985 18.6188C10.7719 18.6188 10.9875 18.6328 11.1469 18.5906C11.1985 19.8609 11.5735 21.375 13.1016 21.4828C13.1016 21.4406 13.1953 21.15 13.1953 21.1359C13.1953 20.3203 12.6985 19.6078 12.6985 18.7781C12.6985 17.4516 13.7156 16.1672 14.7469 15.4172C15.1219 15.1359 15.5766 14.9625 16.0172 14.8031C16.4719 14.6297 16.9547 14.4281 17.3016 14.0812C17.25 13.5562 17.0344 13.0922 16.5094 13.0922C15.211 13.0922 10.8563 13.2797 10.8563 11.2313C10.8563 10.9172 10.861 10.6172 11.6719 10.6172C13.186 10.6172 17.0297 10.9922 18.1547 11.9813C19.0031 12.7359 19.2938 17.2875 16.7016 20.1703ZM12.0797 14.2641C12.5344 14.4094 13.0031 14.4516 13.4719 14.5453C13.125 14.7984 12.8156 15.1078 12.5203 15.4406C12.3891 15.0422 12.2297 14.6531 12.0797 14.2641Z"
                  fill="#8C94A3" />
              </svg>
            </a> </li>
          <li><a href="#"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M12 0C5.37527 0 0 5.37527 0 12C0 18.6248 5.37527 24 12 24C18.6117 24 24 18.6248 24 12C24 5.37527 18.6117 0 12 0ZM19.9262 5.53145C21.3579 7.27549 22.217 9.50107 22.243 11.9089C21.9046 11.8439 18.5206 11.154 15.1106 11.5835C15.0325 11.4143 14.9675 11.2321 14.8894 11.0499C14.6811 10.5554 14.4469 10.0477 14.2126 9.56618C17.9869 8.0304 19.705 5.81779 19.9262 5.53145ZM12 1.77007C14.603 1.77007 16.9848 2.74621 18.7939 4.34707C18.6117 4.60738 17.0629 6.67679 13.4186 8.04338C11.7397 4.95878 9.87855 2.43384 9.5922 2.04338C10.3601 1.86117 11.1671 1.77007 12 1.77007ZM7.63995 2.73319C7.91325 3.09761 9.73538 5.63558 11.4404 8.65508C6.65076 9.9306 2.42083 9.90458 1.96529 9.90458C2.62907 6.72885 4.77657 4.08676 7.63995 2.73319ZM1.74404 12.0131C1.74404 11.9089 1.74404 11.8048 1.74404 11.7007C2.18655 11.7136 7.15835 11.7787 12.2733 10.243C12.5727 10.8156 12.846 11.4013 13.1063 11.9869C12.9761 12.026 12.8329 12.0651 12.7028 12.1041C7.41865 13.8091 4.60738 18.4685 4.3731 18.859C2.7462 17.0499 1.74404 14.6421 1.74404 12.0131ZM12 22.256C9.6312 22.256 7.44469 21.449 5.71367 20.0954C5.89588 19.718 7.97827 15.7094 13.757 13.692C13.783 13.679 13.7961 13.679 13.8221 13.666C15.2668 17.4013 15.8525 20.5379 16.0087 21.436C14.7722 21.9696 13.4186 22.256 12 22.256ZM17.7136 20.4989C17.6096 19.8742 17.0629 16.8807 15.7223 13.1974C18.9371 12.6898 21.7484 13.5228 22.0998 13.6399C21.6573 16.4902 20.0173 18.9501 17.7136 20.4989Z"
                  fill="#8C94A3" />
              </svg>
            </a> </li>
        </ul>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped></style>
