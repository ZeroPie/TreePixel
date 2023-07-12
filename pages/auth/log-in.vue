<script lang="ts" setup>

import EmailValidator from 'email-validator';
import PasswordValidator from 'password-validator';

const supabase = useSupabaseClient()

const emailForLogin = ref<string>("")
const passwordForLogin = ref<string>("")

const rememberMe = ref<boolean>(false)

const inValidEmail = ref<boolean>(false)
const inValidPassword = ref<boolean>(false)

const emailValidationMessage = ref<string>("")
const passwordValidationMessage = ref<string>("")

const loginLoading = ref<boolean>(false)

const emailValidation = async () => {
  if (emailForLogin.value === "") {
    inValidEmail.value = true
    emailValidationMessage.value = "Please enter your email"
    return
  }
  if (!EmailValidator.validate(emailForLogin.value)) {
    inValidEmail.value = true
    emailValidationMessage.value = "You have entered an invalid email address"
    return
  }
  else {
    inValidEmail.value = false
    return
  }
}

const passwordValidation = async () => {
  if (passwordForLogin.value === "") {
    inValidPassword.value = true
    passwordValidationMessage.value = "Please enter your password"
    return
  }
  const schema = new PasswordValidator()
  schema.is().min(6)
  if (!schema.validate(passwordForLogin.value)) {
    inValidPassword.value = true
    passwordValidationMessage.value = "Password should have a minimum length of 6 characters"
    return
  }
  else {
    inValidPassword.value = false
    return
  }
}

const handleLogin = async () => {
  emailValidation()
  passwordValidation()
  try {
    if (inValidEmail.value || inValidPassword.value) return
    loginLoading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailForLogin.value,
      password: passwordForLogin.value
    })
    if (error) {
      alert(error.message)
    }
    if (data) {
      const credentials = {
        username: emailForLogin.value,
        password: passwordForLogin.value
      };
      if (rememberMe.value) {
        localStorage.setItem('credentials', JSON.stringify(credentials));
      }
      else {
        localStorage.removeItem('credentials');
      }
      navigateTo('/private/dashboard')
    }
  } catch (error: any) {
    alert(error.message)
  } finally {
    loginLoading.value = false
  }
}
</script>

<template>
  <div class="signInSection">
    <div class="signinContent">
      <div class="signinContentBox">
        <div class="signinContentBoxInner">
          <a href="/">
            <img src="/images/logo-black.svg" alt="" />
          </a>
          <div class="loginSignUpBtnBox pointer">
            <a class="active">Log in</a>
            <a href="/auth/sign-up">Create an account</a>
          </div>
          <h2>Welcome back, login now</h2>
          <form>
            <div class="form-group">
              <label for="fname">Email address</label>
              <input type="text" class="form-control" v-model="emailForLogin" @input="emailValidation()"
                @blur="emailValidation()">
              <span v-if="inValidEmail" class="error-message">{{ emailValidationMessage }}</span>
            </div>
            <div class="form-group">
              <label for="fname">Password</label>
              <input type="password" class="form-control" v-model="passwordForLogin" @input="passwordValidation()"
                @blur="passwordValidation()">
              <span v-if="inValidPassword" class="error-message">{{ passwordValidationMessage }}</span>
            </div>
            <div class="checkForgotBox">
              <div class="check-box">
                <input id="filled-in-box" class="filled-in" type="checkbox" v-model="rememberMe">
                <label for="filled-in-box">Remember me</label>
              </div>
              <a href="/auth/forgot-password">Forgot Password?</a>
            </div>
            <div>
              <a class="btnsweply blueBtn pointer" v-bind:class="{ 'disabled': loginLoading }" @click="handleLogin">
                {{ loginLoading ? 'Loading' : 'Log in' }}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="signUpMainImgBox">
      <img src="/images/loginBlueBg.webp" alt="" />
    </div>
  </div>
</template>
