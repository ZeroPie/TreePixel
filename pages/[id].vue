<script lang="ts" setup>

const route = useRoute()
const supabase = useSupabaseClient()
const avatarHelper = useAvatarHelper()

const link = route.params.id

const socialLinks = ref<Array<ILink>>()
const filePath = ref<string>("")
const businessName = ref<string>("")
const bioDescription = ref<string>("")
const avatarPath = ref<string>("")
const loading = ref<boolean>(false)
const status = ref<boolean>(false)

interface ILink {
  img: string,
  icon: string,
  title: string,
  description: string,
  nickname: string,
  url: string,
  realprefix: string,
  placeholder: string,
  infolabel: string,
  prefix: string,
  active: boolean,
}

interface Website {
  name: string;
  bio: string;
  filepath: string;
  links: Array<any>;
  status:boolean;
}

const { data: website } = await useAsyncData('website', async () => {
  loading.value = true
  const { data } = await supabase
    .from('website')
    .select('*')
    .eq('link', link)
    .single()

  loading.value = false
  return data
})

if (website.value) {
  businessName.value = (website.value as Website).name ? (website.value as Website).name : ""
  bioDescription.value = (website.value as Website).bio ? (website.value as Website).bio : ""
  filePath.value = (website.value as Website).filepath ? (website.value as Website).filepath : ""
  socialLinks.value = (website.value as Website).links ? (website.value as Website).links : []
  status.value = (website.value as Website).status ? (website.value as Website).status : false
}

if (filePath.value)
  avatarPath.value = await avatarHelper.downloadAvatar(filePath.value);
</script>

<template>
  <div v-if="status" class='mainDeatilPageSection'>
    <div class='mobiledatabox_deployed'>
      <div style="min-height:76vh">
        <div class='userLogo'>
          <v-avatar :size="80" v-if="avatarPath !== ''" :image="avatarPath"></v-avatar>
          <v-avatar :size="80" v-else>
            <img src="/images/user-icon.svg" alt="user" />
          </v-avatar>
        </div>
        <h2 class='font18 font700'>{{ businessName }}</h2>
        <p class='mb0 font16 font500'>{{ bioDescription }}</p>
        <div class='mobileSocialBtnBox'>
          <template v-for="socialLink in socialLinks">
            <div>
              <a class="socialBtnLink font600" v-if="socialLink.active" :href="socialLink.realprefix + socialLink.url"
                target="_blank">
                <img :src="socialLink.icon" alt="user" height="21" />
                {{ socialLink.nickname }}
              </a>
            </div>
          </template>
        </div>
      </div>
      <img class='footerLogo' src="/images/logo-black.svg" alt='user' />
    </div>
  </div>
  <div v-else class="forgotPageSection">
    <img class="forGotBgImg" src="/images/forgotBg.webp" alt="" />
    <div class="forgotWhiteBox">
      <div class="forGotMainBox text-center">
        <a href="/">
          <img src="/images/logo-black.svg" alt="" />
        </a>
        <h5 class="mt-3">Sorry! This link is not existed or paused.</h5>
        <a class="btnsweply mt-3 pointer" href="/">Visit Our Website</a>
      </div>
    </div>
  </div>
</template>
