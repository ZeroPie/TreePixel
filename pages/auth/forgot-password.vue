<script lang="ts" setup>

import EmailValidator from 'email-validator';

const supabase = useSupabaseClient()

const email = ref<string>("")
const loading = ref<boolean>(false)

const inValidEmail = ref<boolean>(false)
const emailValidationMessage = ref<string>("")

const emailValidation = async () => {
  if (email.value === "") {
    inValidEmail.value = true
    emailValidationMessage.value = "Please enter your email"
    return
  }
  if (!EmailValidator.validate(email.value)) {
    inValidEmail.value = true
    emailValidationMessage.value = "You have entered an invalid email address"
    return
  }
  let { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('email', email.value)
  if (profile?.length == 0) {
    inValidEmail.value = true
    emailValidationMessage.value = "That Email is not registered"
    return
  }
  else {
    inValidEmail.value = false
    return
  }
}

const handleResetPassword = async () => {
  await emailValidation()
  try {
    if (inValidEmail.value) return
    loading.value = true
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/update-password`
    })
    if (error) throw error
    alert('Check your email to update password')
  } catch (error: any) {
    alert(error.error_description || error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="forgotPageSection">
    <img class="forGotBgImg" src="/images/forgotBg.webp" alt="" />
    <div class="forgotWhiteBox">
      <div class="forGotMainBox">
        <a href="/">
          <img src="/images/logo-black.svg" alt="" />
        </a>
        <h2 class="font24">Reset your password</h2>
        <div class="form-group">
          <label for="fname">Email address</label>
          <input type="text" class="form-control" v-model="email" @input="emailValidation()" @blur="emailValidation()">
          <span v-if="inValidEmail" class="error-message">{{ emailValidationMessage }}</span>
        </div>
        <a class="btnsweply pointer" @click="handleResetPassword()" v-bind:class="{ 'disabled': loading }">{{ loading ?
          'Loading'
          : 'Reset password' }}</a>
        <!-- <p class="rememberTxt">Remembered my password</p> -->
      </div>
    </div>
  </div>
</template>

<style scoped></style>
