<script lang="ts" setup>

import EmailValidator from 'email-validator';
import PasswordValidator from 'password-validator';

const supabase = useSupabaseClient()
const route = useRoute()

const userNameForSignup = ref<string>("")
const emailForSignup = ref<string>("")
const passwordForSignup = ref<string>("")
const inValidUserName = ref<boolean>(false)
const inValidEmail = ref<boolean>(false)
const inValidPassword = ref<boolean>(false)

const userNameValidationMessage = ref<string>("")
const emailValidationMessage = ref<string>("")
const passwordValidationMessage = ref<string>("")

const signupLoading = ref<boolean>(false)

onMounted(() => {
  if (route.query.username) {
    userNameForSignup.value = route.query.username as string
    userNameValidation()
  }
  else
    userNameForSignup.value = ""
});

const userNameValidation = async () => {
  if (userNameForSignup.value === "") {
    inValidUserName.value = true
    userNameValidationMessage.value = "Please enter username"
    return
  }
  const regex = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
  if (regex.test(userNameForSignup.value)) {
    inValidUserName.value = true
    userNameValidationMessage.value = "Usernames can only include letters, numbers, underscores ( _ ) and dash ( - )"
    return
  }
  let { data: website } = await supabase
    .from('website')
    .select('*')
    .eq('link', userNameForSignup.value)
  if (website?.length != 0) {
    inValidUserName.value = true
    userNameValidationMessage.value = "That username is already taken"
    return
  }
  else {
    inValidUserName.value = false
    return
  }
}

const emailValidation = async () => {
  if (emailForSignup.value === "") {
    inValidEmail.value = true
    emailValidationMessage.value = "Please enter your email"
    return
  }
  if (!EmailValidator.validate(emailForSignup.value)) {
    inValidEmail.value = true
    emailValidationMessage.value = "You have entered an invalid email address"
    return
  }
  let { data: profile } = await supabase
    .from('profile')
    .select('*')
    .eq('email', emailForSignup.value)
  if (profile?.length != 0) {
    inValidEmail.value = true
    emailValidationMessage.value = "That Email is already taken"
    return
  }
  else {
    inValidEmail.value = false
    return
  }
}

const passwordValidation = async () => {
  if (passwordForSignup.value === "") {
    inValidPassword.value = true
    passwordValidationMessage.value = "Please enter your password"
    return
  }
  const schema = new PasswordValidator()
  schema.is().min(6)
  if (!schema.validate(passwordForSignup.value)) {
    inValidPassword.value = true
    passwordValidationMessage.value = "Password should have a minimum length of 6 characters"
    return
  }
  else {
    inValidPassword.value = false
    return
  }
}

const handleSignUp = async () => {
  await userNameValidation()
  await emailValidation()
  await passwordValidation()
  try {
    if (inValidUserName.value || inValidEmail.value || inValidPassword.value) return
    signupLoading.value = true
    const { error, data } = await supabase.auth.signUp({
      email: emailForSignup.value,
      password: passwordForSignup.value,
      options: {
        emailRedirectTo: `${window.location.origin}/private/dashboard`
      }
    })
    if (data && data.user) {
      const userInfo = [{
        id: data.user.id,
        username: userNameForSignup.value,
        email: emailForSignup.value
      }]
      let { error: error1 } = await supabase.from('profile').insert(userInfo as never[])
      const websiteInfo = [{
        user_id: data.user.id,
        link: userNameForSignup.value,
      }]
      let { error: error2 } = await supabase.from('website').insert(websiteInfo as never[])
    }
    if (error) {
      alert(error.message)
    } else {
      navigateTo(`/auth/verify?email=${emailForSignup.value}`)
    }
  } catch (error: any) {
    console.log(error.message)
  } finally {
    signupLoading.value = false
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
            <a href="/auth/log-in">Log in</a>
            <a class="active">Create an account</a>
          </div>
          <h2>Create your free account today</h2>
          <form>
            <div class="stepBox">
              <div class="stepTxt"><span>Step 1.</span> Choose your Treepixel username. You can always change it later.
              </div>
              <div class="form-group">
                <input type="text" class="form-control username-input" placeholder="Username" v-model="userNameForSignup"
                  @input="userNameValidation()" @blur="userNameValidation()">
                <span v-if="inValidUserName" class="error-message">{{ userNameValidationMessage }}</span>
              </div>
            </div>
            <div class="stepBox">
              <div class="stepTxt"><span>Step 2.</span> Enter your email and set a secure password for your account.</div>
              <div class="form-group">
                <label for="femail">Email address</label>
                <input type="email" class="form-control" placeholder="Enter email address" v-model="emailForSignup"
                  @input="emailValidation()" @blur="emailValidation()">
                <span v-if="inValidEmail" class="error-message">{{ emailValidationMessage }}</span>
              </div>
              <div class="form-group">
                <label for="fpassword">Password</label>
                <input type="password" class="form-control" placeholder="Enter password" v-model="passwordForSignup"
                  @input="passwordValidation()" @blur="passwordValidation()">
                <span v-if="inValidPassword" class="error-message">{{ passwordValidationMessage }}</span>
              </div>
            </div>
            <p class="PrivacyPolicyTxt">By creating a Treepixel account, you agree to the <a href="">Privacy policy</a>
              and
              <a href="">Terms of service.</a>
            </p>
            <div>
              <a class="btnsweply pointer" v-bind:class="{ 'disabled': signupLoading }" @click="handleSignUp">
                {{ signupLoading ? 'Loading' : 'Create account' }}
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="signUpMainImgBox">
      <img src="/images/loginBg.webp" alt="" />
    </div>
  </div>
</template>

<style scoped></style>

