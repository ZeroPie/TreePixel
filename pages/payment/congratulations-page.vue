<script lang="ts" setup>
import { onMounted } from 'vue';

interface Success {
    current_period_end: number,
    current_period_start: number,
    price: number,
    interval: string,
}

const current_period_end = ref<number>(0)
const current_period_start = ref<number>(0)
const price = ref<number>(0)
const interval = ref<string>('')
const loading = ref<boolean>(true)

let successData = ref<Success>()
const getSuccessData = async() => {
    console.log('fist step')
    const { data } = await useFetch('/api/success')
    console.log(data.value)
    current_period_end.value = data.value?.current_period_end ? data.value?.current_period_end : 0
    current_period_start.value = data.value?.current_period_start ? data.value?.current_period_start : 0
    price.value = data.value?.price ? data.value.price : 0
    interval.value = data.value?.interval ? data.value?.interval : ''
    loading.value = false
}
onMounted(() => {
    setTimeout(() => {
        getSuccessData();
    }, 4000)
})
</script>
<template>
    <div class="billingPageSection">
        <div class="container">
         <div class="congratulationsPurchaseSection text-center">
            <div class="purchaseMainBox" v-if="!loading">
                <img class="blackLogoImg" src="/images/logo-black.svg" alt=""/>
                <img src="/images/congratulations-icon.svg" alt=""/>
                <h2>Congratulations on your purchase!</h2>
                <h3> 🎉 You're now a premium member.</h3>
                <div class="purchasePlanInfoBox">
                    <div class="purchasePlanBox">
                       <p class="mb-0">Plan: Pro Plan ({{interval}}ly)</p>
                       <p class="mb-0">Price: ${{ price / 100 }} per {{ interval }}</p>
                       <p class="mb-0">Period: {{ new Date(current_period_start * 1000).toLocaleString('default', {month: 'short'}) }} {{ new Date(current_period_start * 1000).getDate() }},{{ new Date(current_period_start * 1000).getFullYear() }}  ~  {{ new Date(current_period_end * 1000).toLocaleString('default', {month: 'short'}) }} {{ new Date(current_period_end * 1000).getDate() }},{{ new Date(current_period_end * 1000).getFullYear() }}</p>
                    </div>
                </div>     
                <p class="checkEmailTxt">Enjoy your Pro plan and its premium features!</p>
                <a class="btnsweply pointer dashboardBtn" href="/private/dashboard">{{ loading ? 'Loading' : 'Redirect to dashboard' }}</a>
            </div>
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
<style>
    .dashboardBtn {
        width: 250px;
        margin: auto;
    }
</style>