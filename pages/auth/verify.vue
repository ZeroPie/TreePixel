<script lang="ts" setup>

const supabase = useSupabaseClient()
const route = useRoute()
const email = ref<string>("INBOX")

const loading = ref<boolean>(false)

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string
  }
});

const handleResendEmail = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.value
    })
    if (error) alert(error.message)
    else {
      alert('We have just sent a verification email again. Check your email for the login link!')
    }
  } catch (error: any) {
    alert(error.error_description || error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- <div class="bgDivMain"> -->
  <div class="forgotPageSection">
    <img class="forGotBgImg" src="/images/bg-image.webp" alt="" />
    <div class="veryficationSection">
      <div class="sectionLogo">
        <img src="/images/logo-black.svg" alt="" />
      </div>
      <div class="veryficationDesc">
        Great news! We've just sent a verification email to {{ email }} Please check your email and follow the
        instructions to complete the verification process.
      </div>
      <div class="veryficationNotReceived">
        If you didn’t receive any email, click on resend.
      </div>
      <a class="resendAgainBtn pointer" @click="handleResendEmail" v-bind:class="{ 'disabled': loading }">
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.4167 11.1913C17.2067 11.1259 16.9794 11.1461 16.7842 11.2476C16.5891 11.3491 16.442 11.5235 16.375 11.733C15.9813 12.9367 15.2138 13.9835 14.1841 14.7209C13.1545 15.4583 11.9164 15.8479 10.65 15.833C9.08362 15.8508 7.57411 15.2467 6.45248 14.1532C5.33084 13.0597 4.68863 11.566 4.66667 9.99968C4.68863 8.43336 5.33084 6.93967 6.45248 5.84615C7.57411 4.75263 9.08362 4.14854 10.65 4.16635C12.0646 4.16293 13.4358 4.65535 14.525 5.55802L12.7167 5.25802C12.6083 5.24018 12.4975 5.24395 12.3905 5.2691C12.2836 5.29425 12.1827 5.34029 12.0937 5.40457C12.0046 5.46885 11.9291 5.5501 11.8716 5.64365C11.814 5.7372 11.7755 5.8412 11.7583 5.94968C11.7405 6.05806 11.7443 6.16889 11.7694 6.27581C11.7946 6.38273 11.8406 6.48361 11.9049 6.57268C11.9692 6.66174 12.0504 6.73721 12.144 6.79476C12.2375 6.85231 12.3415 6.8908 12.45 6.90802L15.9833 7.49135H16.125C16.2216 7.49123 16.3175 7.47432 16.4083 7.44135C16.4389 7.42976 16.4671 7.41283 16.4917 7.39135C16.5514 7.36913 16.6076 7.33825 16.6583 7.29968L16.7333 7.20801C16.7333 7.16635 16.8083 7.13302 16.8417 7.08302C16.875 7.03302 16.8417 6.99968 16.8833 6.96635C16.9064 6.91782 16.9259 6.86769 16.9417 6.81635L17.5667 3.48302C17.5875 3.37358 17.5865 3.26112 17.5638 3.15206C17.5412 3.043 17.4972 2.93947 17.4345 2.84738C17.3719 2.7553 17.2917 2.67646 17.1985 2.61537C17.1054 2.55429 17.0011 2.51214 16.8917 2.49135C16.7822 2.47056 16.6698 2.47152 16.5607 2.49419C16.4516 2.51686 16.3481 2.56079 16.256 2.62347C16.0701 2.75005 15.942 2.94533 15.9 3.16635L15.675 4.37468C14.28 3.16572 12.496 2.50004 10.65 2.49968C8.64161 2.4819 6.7082 3.2616 5.274 4.66767C3.83981 6.07374 3.02199 7.99133 3 9.99968C3.02199 12.008 3.83981 13.9256 5.274 15.3317C6.7082 16.7378 8.64161 17.5175 10.65 17.4997C12.2776 17.5247 13.8703 17.0265 15.1934 16.0783C16.5166 15.1302 17.5004 13.7823 18 12.233C18.0316 12.1263 18.0415 12.0144 18.0292 11.9038C18.0168 11.7932 17.9825 11.6862 17.9281 11.5891C17.8737 11.492 17.8005 11.4068 17.7126 11.3385C17.6248 11.2702 17.5242 11.2201 17.4167 11.1913Z"
            fill="#333B4A" />
        </svg>
        {{ loading ? 'Loading' : 'Resend again' }}
      </a>
    </div>
  </div>
</template>

<style scoped></style>