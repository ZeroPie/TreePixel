<script lang="ts" setup>
const user = useSupabaseUser()
watchEffect(() => {
  if (user.value) {
    return navigateTo('/private/dashboard');
  }
});
</script>

<template>
  <div class="forgotPageSection">
    <img class="forGotBgImg" src="/images/bg-image.webp" alt="" />
    <div class="veryficationSection">
      <div class="sectionLogo">
        <img src="/images/logo-black.svg" alt="" />
      </div>
      <div class="veryficationDesc">
        Fantastic! You're all set! Consider yourself officially part of the family. Let's get started on an amazing journey together!
      </div>
      <div class="veryficationNotReceived">
        Redirecting you now to your dashboard ...
      </div>
    </div>
  </div>
</template>

<style scoped></style>