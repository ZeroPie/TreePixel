<script lang="ts" setup>

const route = useRoute()
const supabase = useSupabaseClient()
const avatarHelper = useAvatarHelper()
import { onMounted } from 'vue';

onMounted(async () => {
  await fetch(`/api/visited?linkTo=${link}`)
})

const link = route.params.id

const socialLinks = ref<Array<ILink>>()
const avatarFilePath = ref<string>("")
const businessName = ref<string>("")
const bioDescription = ref<string>("")
const avatarPath = ref<string>("")
const loading = ref<boolean>(false)
const status = ref<boolean>(false)
const hideBranding = ref<boolean>(false)

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
  avatarfilepath: string;
  links: Array<any>;
  status: boolean;
  hideBranding: boolean;
}

supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'website' },
    (payload) => {
      if(payload.new as Website) {
        businessName.value = (payload.new as Website).name ? (payload.new as Website).name : ""
        bioDescription.value = (payload.new as Website).bio ? (payload.new as Website).bio : ""
        avatarFilePath.value = (payload.new as Website).avatarfilepath ? (payload.new as Website).avatarfilepath : ""
        socialLinks.value = (payload.new as Website).links ? (payload.new as Website).links : []
        status.value = (payload.new as Website).status ? (payload.new as Website).status : false
        hideBranding.value = (payload.new as Website).hideBranding ? (payload.new as Website).hideBranding : false
      }
    }
  )
  .subscribe()

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
console.log(website.value)
if (website.value) {
  businessName.value = (website.value as Website).name ? (website.value as Website).name : ""
  bioDescription.value = (website.value as Website).bio ? (website.value as Website).bio : ""
  avatarFilePath.value = (website.value as Website).avatarfilepath ? (website.value as Website).avatarfilepath : ""
  socialLinks.value = (website.value as Website).links ? (website.value as Website).links : []
  status.value = (website.value as Website).status ? (website.value as Website).status : false
  hideBranding.value = (website.value as Website).hideBranding ? (website.value as Website).hideBranding : false
}

if (avatarFilePath.value)
  avatarPath.value = await avatarHelper.downloadAvatar(avatarFilePath.value);

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
      <img v-if="!hideBranding" class='footerLogo' src="/images/logo-black.svg" alt='user' />
    </div>
  </div>
    <div v-else class="middleSectionBox middle404">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between">
          <div class="w-50">
            <a href="/">
              <img src="/images/logo.svg" alt="" />
            </a>
            <div class="pageNotFoundHead font600">
              Sorry!
            </div>
            <div class="sorryContentDesc">
              This link is not existed or paused.<br>
            </div>
            <div>
              <a class="claimBtn" href="/">Take me home</a>
            </div>
          </div>
          <div class="w-50" style="text-align: right;">
            <img src="/images/image-404.svg" style="width: 80%;" alt="" />
          </div>
        </div>
      </div>
    </div>
</template>
