<script lang="ts" setup>

import PasswordValidator from 'password-validator';

const supabase = useSupabaseClient()
const supabaseAuth = useSupabaseAuthClient()

const password = ref<string>("")
const rpassword = ref<string>("")
const inValidPassword = ref<boolean>(false)
const inValidrPassword = ref<boolean>(false)
const passwordValidationMessage = ref<string>("")
const rpasswordValidationMessage = ref<string>("")

const loading = ref<boolean>(false)

const passwordValidation = async () => {
  if (password.value === "") {
    inValidPassword.value = true
    passwordValidationMessage.value = "Please enter your password"
    return
  }
  const schema = new PasswordValidator()
  schema.is().min(6)
  if (!schema.validate(password.value)) {
    inValidPassword.value = true
    passwordValidationMessage.value = "Password should have a minimum length of 6 characters"
    return
  }
  else {
    inValidPassword.value = false
    return
  }
}

const rpasswordValidation = async () => {
  if (rpassword.value === "") {
    inValidrPassword.value = true
    rpasswordValidationMessage.value = "Please enter your password"
    return
  }
  const schema = new PasswordValidator()
  schema.is().min(6)
  if (!schema.validate(rpassword.value)) {
    inValidrPassword.value = true
    rpasswordValidationMessage.value = "Password should have a minimum length of 6 characters"
    return
  }
  else {
    inValidrPassword.value = false
    return
  }
}

const handleUpdate = async () => {
  await passwordValidation()
  await rpasswordValidation()
  if (password.value != rpassword.value) {
    alert("Confirm password does not match with your password")
    return
  }
  try {
    if (inValidPassword.value || inValidrPassword.value) return
    loading.value = true
    const { data, error } = await supabase.auth.updateUser({
      password: password.value
    })
    if (error) throw error
    if (data) {
      let { error } = await supabaseAuth.auth.signOut()
      if (error) throw error
      localStorage.removeItem('credentials');
      navigateTo('/auth/rpass-success')
    }
  }
  catch (error: any) {
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
          <label for="fname">New password</label>
          <input type="password" class="form-control" v-model="password" @input="passwordValidation()"
            @blur="passwordValidation()">
          <span v-if="inValidPassword" class="error-message">{{ passwordValidationMessage }}</span>
        </div>
        <div class="form-group">
          <label for="fname">Confirm password</label>
          <input type="password" class="form-control" v-model="rpassword" @input="rpasswordValidation()"
            @blur="rpasswordValidation()">
          <span v-if="inValidrPassword" class="error-message">{{ rpasswordValidationMessage }}</span>
        </div>
        <a class="btnsweply pointer" @click="handleUpdate()" v-bind:class="{ 'disabled': loading }">{{ loading ? 'Loading' :
          'Reset password' }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
