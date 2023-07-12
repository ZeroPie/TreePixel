<script lang="ts" setup>
import { ref } from "vue";

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const supabaseAuth = useSupabaseAuthClient()
const user = useSupabaseUser();

const route = useRoute()

const avatarHelper = useAvatarHelper()

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
  links: Array<ILink>;
}

const socialLinks = ref<Array<ILink>>(
  [
    {
      img: "/images/social-link.svg",
      icon: "/images/icon-map.svg",
      title: "Website",
      description: " Include your website URL to enhance your online presence",
      nickname: "Website",
      url: "",
      realprefix: "https://",
      placeholder: "www.example.com",
      infolabel: "Website URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-email.svg",
      icon: "/images/email-icon-w.svg",
      title: "Email",
      description: "Make it easier for users to directly get in touch",
      nickname: "Email",
      url: "",
      realprefix: "mailto:",
      placeholder: "example@email.com",
      infolabel: "Email address",
      prefix: "✉️",
      active: false,
    },
    {
      img: "/images/social-map.svg",
      icon: "/images/map-icon-w.svg",
      title: "Google map",
      description: "Share your business location for accurate directions and easy navigation",
      nickname: "Google map",
      url: "",
      realprefix: "https://",
      placeholder: "www.example.com",
      infolabel: "Map URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-tiktok.svg",
      icon: "/images/tiktok-icon-w.svg",
      title: "Tiktok",
      description: "Redirect users to connect with your profile",
      nickname: "Tiktok",
      url: "",
      realprefix: "https://www.tiktok.com/@",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-insta.svg",
      icon: "/images/icon-insta.svg",
      title: "Instagram",
      description: "Redirect users to connect with your profile",
      nickname: "Instagram",
      url: "",
      realprefix: "https://www.instagram.com/",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-twitter.svg",
      icon: "/images/icon-twitter.svg",
      title: "Twitter",
      description: "Redirect users to connect with your profile",
      nickname: "Twitter",
      url: "",
      realprefix: "https://twitter.com/",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-whatapp.svg",
      icon: "/images/whatsapp-icon-w.svg",
      title: "Whatsapp",
      description: "Make it easier for users to directly get in touch",
      nickname: "Whatsapp no.",
      url: "",
      realprefix: "https://wa.me/",
      placeholder: "1234567890",
      infolabel: "WhatsApp number",
      prefix: "wa.me/",
      active: false,
    },
    {
      img: "/images/social-snapchat.svg",
      icon: "/images/snapchat-icon-w.svg",
      title: "Snapchat",
      description: "Redirect users to connect with your profile",
      nickname: "Snapchat",
      url: "",
      realprefix: "https://www.snapchat.com/add/",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-telegram.svg",
      icon: "/images/telegram-icon-w.svg",
      title: "Telegram",
      description: "Make it easier for users to directly get in touch",
      nickname: "Telegram",
      url: "",
      realprefix: "https://t.me/",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-linkden.svg",
      icon: "/images/linkedin-icon-w.svg",
      title: "LinkedIn",
      description: "Redirect users to connect with your profile",
      nickname: "LinkedIn",
      url: "",
      realprefix: "https://",
      placeholder: "www.linkedin.com",
      infolabel: "LinkedIn URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-facebook.svg",
      icon: "/images/facebook-icon-w.svg",
      title: "Facebook",
      description: "Redirect users to connect with your profile",
      nickname: "Facebook",
      url: "",
      realprefix: "https://www.facebook.com/",
      placeholder: "add username",
      infolabel: "Username",
      prefix: "@",
      active: false,
    },
    {
      img: "/images/social-youtube.svg",
      icon: "/images/youtube-icon-w.svg",
      title: "Youtube",
      description: "Redirect users to connect with your profile",
      nickname: "Youtube",
      url: "",
      realprefix: "https://",
      placeholder: "www.youtube.com",
      infolabel: "Youtube URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-apple.svg",
      icon: "/images/icon-apple.svg",
      title: "iOS app",
      description: "Redirect users to install your app",
      nickname: "iOS app",
      url: "",
      realprefix: "https://",
      placeholder: "apps.apple.com/...",
      infolabel: "App store URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-googleplay.svg",
      icon: "/images/icon-googleplay.svg",
      title: "Android app",
      description: "Redirect users to install your app",
      nickname: "Android app",
      url: "",
      realprefix: "https://",
      placeholder: "Play.google.com/...",
      infolabel: "Google play URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-hunger.svg",
      icon: "/images/hungerstation-icon.svg",
      title: "Hunger",
      description: "Make it easier for users to get in touch and order from your store",
      nickname: "Hunger",
      url: "",
      realprefix: "https://",
      placeholder: "www.hungerstation.com/12345",
      infolabel: "Store URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-jahez.svg",
      icon: "/images/jahez-icon.svg",
      title: "Jahez",
      description: "Make it easier for users to get in touch and order from your store",
      nickname: "Jahez",
      url: "",
      realprefix: "https://",
      placeholder: "www.jahez.com/12345",
      infolabel: "Store URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-15.svg",
      icon: "/images/Marsool-icon.svg",
      title: "Marsool",
      description: "Make it easier for users to get in touch and order from your store",
      nickname: "Marsool",
      url: "",
      realprefix: "https://",
      placeholder: "www.marsool.sa/12345",
      infolabel: "Store URL",
      prefix: "https://",
      active: false,
    },
    {
      img: "/images/social-16.svg",
      icon: "/images/toyou-icon.svg",
      title: "Toyou",
      description: "Make it easier for users to get in touch and order from your store",
      nickname: "Toyou",
      url: "",
      realprefix: "https://",
      placeholder: "www.toyou.com.sa/12345",
      infolabel: "Store URL",
      prefix: "https://",
      active: false,
    },
  ]
);
const socialLinks_active = ref<Array<ILink>>([])
const link = ref<string>("")
const businessName = ref<string>("")
const bioDescription = ref<string>("")
const filePath = ref<string>("")
const avatarPath = ref<string>("")
const textAreaHeight: Ref<number> = ref(100)
const createdSiteUrl = ref<string>("")
const componentKey = ref(0)
const signoutLoading = ref<boolean>(false)
const websiteLoading = ref<boolean>(false)

onMounted(() => {
  const element_1: HTMLDivElement | null = document.querySelector('#loadingSpinner');
  if (element_1) {
    element_1.style.display = 'none';
  }
  const menuIcon: HTMLDivElement | null = document.querySelector('.menuIcon');
  const closeMenu: HTMLDivElement | null = document.querySelector('.closeMenu');

  if (menuIcon) {
    menuIcon.addEventListener('click', () => {
      document.body.classList.add('menuOpen');
    });
  }

  if (closeMenu) {
    closeMenu.addEventListener('click', () => {
      document.body.classList.remove('menuOpen');
    });
  }
})

if (route.query) {
  link.value = route.query.link as string
}

const { data: website } = await useAsyncData('website', async () => {
  websiteLoading.value = true
  const { data } = await supabase
    .from('website')
    .select('*')
    .eq('link', link.value)
    .single()
  websiteLoading.value = false
  return data
})

if (website.value) {
  businessName.value = (website.value as Website).name ? (website.value as Website).name : ""
  bioDescription.value = (website.value as Website).bio ? (website.value as Website).bio : ""
  filePath.value = (website.value as Website).filepath ? (website.value as Website).filepath : ""
  socialLinks_active.value = (website.value as Website).links ? (website.value as Website).links : []
  socialLinks.value = socialLinks.value.map(socialLink => (socialLinks_active.value).filter(({ title }) => socialLink.title === title).length > 0 ? ({ ...socialLink, active: true }) : socialLink)
  if (filePath.value)
    avatarPath.value = await avatarHelper.downloadAvatar(filePath.value);
}

function resizeTextArea(): void {
  const element: HTMLTextAreaElement | null = document.querySelector('textarea');
  if (element) {
    element.style.height = '100px';
    element.style.height = `${element.scrollHeight}px`;
    textAreaHeight.value = element.scrollHeight;
  }
}

const toggleActive = (index: number, title: string) => {
  socialLinks.value = socialLinks.value.map((socialLink, id) => index === id ? ({ ...socialLink, active: !socialLink.active }) : socialLink)
  if (socialLinks_active.value.filter(link => link.title === title).length > 0)
    socialLinks_active.value.splice(socialLinks_active.value.findIndex(link => link.title === title), 1);
  else
    socialLinks_active.value.push(socialLinks.value[index])
}

const deleteSocialLinkActiveById = (title: string) => {
  socialLinks_active.value = socialLinks_active.value.filter((link: { title: string }) => link.title !== title);
  componentKey.value += 1;
  (socialLinks.value.find((link: { title: string }) => link.title === title) as any).active = false;
}

const changeOrderHandler = (oldIndex: number, newIndex: number) => {
  const arr = socialLinks_active.value.slice()
  const oldValue = arr[oldIndex]
  arr[oldIndex] = arr[newIndex]
  arr[newIndex] = oldValue
  socialLinks_active.value = arr
  componentKey.value += 1;
}

const saveData = async () => {
  const element_1: HTMLDivElement | null = document.querySelector('#loadingSpinner');
  if (element_1) {
    element_1.style.display = 'block';
  }
  const userInfo = [{
    name: businessName.value,
    bio: bioDescription.value,
    filepath: filePath.value,
    links: socialLinks_active.value,
    status: true
  }]

  const { error } = await supabase
    .from('website')
    .update(userInfo[0] as never)
    .eq('link', link.value)
  if (error)
    alert(error.message)
  else {
    createdSiteUrl.value = `${window.location.origin}/${link.value}`
    const element_2: HTMLButtonElement | null = document.querySelector('#openModal');
    element_2?.click()
  }
  if (element_1) {
    element_1.style.display = 'none';
  }
}

const saveUrl = () => {
  navigator.clipboard.writeText(createdSiteUrl.value).then(() => {
    alert("Link copied to clipboard");
  });
};

const redirectToNewSite = () => {
  const url = createdSiteUrl.value;
  window.open(url, '_blank');
}

const refreshPage = () => {
  window.location.reload()
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

</script>

<template>
  <main>
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
              <ul>
                <li class="pointer"><a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut" class="claimBtn">
                    {{ signoutLoading ? 'Loading' : 'Log out' }}
                  </a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="mainSection">
      <!-- <div class="freeLandingPagemsg font600">
        🎉🥳 100% Free , Create your landing page NOW🥳 🎉
      </div> -->
      <div class="leftSideSection">
        <div class="headTitleBoxEdit">
          <h2 class="font24 font700 mb0">Let’s create your website</h2>
          <p class="colorGrey mb0">All under 3 steps - ready?</p>
        </div>
        <div class="stepOneSection">
          <div class="stepTitle">
            <h3 class="font16 font700 mb0">1. Fill in your business information</h3>
            <p class="colorGrey mb0">Tell us few things about your brand</p>
          </div>
          <div class="userInfoBox">
            <div class="mb-3 form-group">
              <label class="form-label">Business name</label>
              <input type="text" class="form-control" name="text" v-model="businessName" maxlength="40" />
              <span v-if="businessName.length >= 40" class="error-message">Business name must be 40 characters or
                less.</span>
            </div>
            <div class="mb-3 mt-3 form-group">
              <label class="form-label">Bio description (Optional)</label>
              <textarea class="form-control" v-model="bioDescription" :style="{ height: `${textAreaHeight}px` }"
                @input="resizeTextArea" maxlength="250"></textarea>
              <span v-if="bioDescription.length >= 250" class="error-message">Bio description must be 250 characters or
                less.</span>
            </div>
            <div class="userLogoBox">
              <h2>Logo (Optional)</h2>
              <UploadAvatar v-model:path="avatarPath" @update:filePath="$event => filePath = $event" />
            </div>
          </div>
        </div>
        <div class="stepOneSection stepTwoSection">
          <div class="stepTitle">
            <h3 class="font16 font700 mb0">2. Link your social profiles</h3>
            <p class="colorGrey mb0">Redirect your audience to the below social media profile pages</p>
          </div>
          <div class="allSocialSection">
            <div class="socialIconBx" v-for="(socialLink, id) in socialLinks" :key="id" :active="socialLink.active">
              <img :src="socialLink.img" alt="icon" @click="toggleActive(id, socialLink.title)" class="pointer"
                height="48" />
              <div class="addplusBx pointer" size="20" @click="toggleActive(id, socialLink.title)">
                <i v-if="socialLink.active" class="mdi mdi-minus" alt="minus"></i>
                <img v-else src="/images/plus-icon.svg" alt="plus" />
              </div>
            </div>
          </div>
        </div>
        <div class="stepLinkSection">
          <div class="stepTitle">
            <h3 class="font16 font700 mb0">My selected links</h3>
            <p class="colorGrey mb0">Personalize your social profiles here</p>
          </div>
          <div class="linksboxSection">
            <LinksBox :socialLinks_active="socialLinks_active" @change-order="changeOrderHandler"
              @delete-link="deleteSocialLinkActiveById" :key="componentKey" />
          </div>
        </div>
      </div>
      <div class="rightSideSection">
        <div class="publishSection">
          <h2 class="font16 font700">3. Publish your website</h2>
          <button class="launchSiteBtn font700 font16" :disabled="!businessName.trim()"
            data-bs-toggle="modal" data-bs-target="#ConfirmLaunchModal">
            <img src="/images/icon-map.svg" alt="user" />
            Launch site</button>
          <button type="button" class="btn btn-primary d-none" id="openModal" data-bs-toggle="modal"
            data-bs-target="#launchSiteModal"></button>
        </div>
        <div class="mobilePreviewSection text-center">
          <h2 class="font16 font700">
            Website preview
            <!-- <span class="informationSpan position-relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_15_13721)">
                  <path
                    d="M11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8ZM11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V12ZM12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                    fill="#6F7582" />
                </g>
                <defs>
                  <clipPath id="clip0_15_13721">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span class="posAbsolute noteSection noteSectionTop p16 bgLightGray contentGrayColor">
                Note that the preview may differ upon launch, including background, layout, and sizes, due to variations
                in operating systems and screen sizes.
              </span>
            </span> -->
          </h2>
          <div class="mobileMainBox">
            <img src="/images/mobile.svg" class="mobilePhoneBGImg" alt="wallet" />
            <div class="mobiledatabox hide-scrollbar">
              <div class="mobileScreenWithOutLogo">
                <div class="userLogo" style="margin-top: 25px;">
                  <v-avatar :size="64" v-if="avatarPath !== ''" :image="avatarPath"></v-avatar>
                  <v-avatar :size="64" v-else>
                    <img src="/images/user-icon.svg" alt="user" />
                  </v-avatar>
                </div>
                <h2 class="font16 font500">{{ businessName }}</h2>
                <p class="mb0">{{ bioDescription }}</p>
                <div class="mobileSocialBtnBox">
                  <div v-for="socialLink in socialLinks_active">
                    <a class="socialBtnLink font600" v-if="socialLink.active"
                      :href="socialLink.realprefix + socialLink.url" target="_blank">
                      <img :src="socialLink.icon" alt="icon" height="18" width="21" /> {{ socialLink.nickname }}
                    </a>
                  </div>
                </div>
              </div>
              <div class="text-center">
                <img src="/images/logo-black_mobile.svg" style="margin-top: 5px; margin-bottom: 5px;" alt="user" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade successModel" id="launchSiteModal" tabindex="-1" aria-labelledby="exampleModalLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title h4" id="exampleModalLabel">Congratulations - your website is live! 🎉</h1>
          </div>
          <div class="modal-body">
            <div class="websiteReadyContent text-center">
              <div class="successiconimg">
                <img src="/images/success-icon.svg" alt="plus" />
              </div>
              <div class="successHead">
                Your website is available for the world to see
              </div>
              <div class="successDesc">
                Enjoy the excitement of sharing your ideas, products, or services with the world. And contact us if...
              </div>
              <div class="successCopyMain">
                <div class="successCopyURL">Your website URL</div>
                <div class="row">
                  <div class="successCopyTxt col-md-11">{{ createdSiteUrl }}</div>
                  <button class="successCopyBtn col-md-1" @click="saveUrl()">
                    <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.5 18.5H2.5V5.5C2.5 4.95 2.05 4.5 1.5 4.5C0.95 4.5 0.5 4.95 0.5 5.5V18.5C0.5 19.6 1.4 20.5 2.5 20.5H12.5C13.05 20.5 13.5 20.05 13.5 19.5C13.5 18.95 13.05 18.5 12.5 18.5ZM17.5 14.5V2.5C17.5 1.4 16.6 0.5 15.5 0.5H6.5C5.4 0.5 4.5 1.4 4.5 2.5V14.5C4.5 15.6 5.4 16.5 6.5 16.5H15.5C16.6 16.5 17.5 15.6 17.5 14.5ZM15.5 14.5H6.5V2.5H15.5V14.5Z"
                        fill="#107569" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="onenWebsiteBtn btn btn-primary"
              @click="{ redirectToNewSite(); refreshPage(); }">Open my website</button>
            <button type="button" class="doneBtn btn btn-secondary" data-bs-dismiss="modal" @click="refreshPage()"
              aria-label="Close">Done</button>
          </div>
        </div>
      </div>
    </div>

    <div class="overlay" id="loadingSpinner">
      <div class="d-flex justify-content-center">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem; z-index: 20;">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>

    <div class="modal" id="ConfirmLaunchModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Confirm you website Launch</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            Please note that once confirmed, your website can be edited. You will have access to this page again to
            modify your links.
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary confirmLaunchBtn" data-bs-dismiss="modal"
              @click="saveData()">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
