<script lang="ts" setup>
import { ref } from "vue";
import Analytics from '../../components/Analytics.vue';

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const supabaseAuth = useSupabaseAuthClient()
const user = useSupabaseUser();
const route = useRoute()
const avatarHelper = useAvatarHelper()
const photoHelper = usePhotoHelper()

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
  show: boolean,
  active: boolean,
  pro: boolean,
  type: number,
}

interface Website {
  id: number;
  name: string;
  bio: string;
  avatarfilepath: string;
  links: Array<ILink>;
  status: boolean;
  hideBranding: boolean;
  available_use: boolean;
}

interface Profile {
  username: string;
  email: string;
  is_subscribed: boolean;
  interval: string;
  current_period_end: Date;
  photo: string;
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: false,
      type: 1,
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
      show: false,
      active: false,
      pro: true,
      type: 2,
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
      show: false,
      pro: false,
      type: 2,
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
      show: false,
      active: false,
      pro: true,
      type: 3,
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
      show: false,
      active: false,
      pro: true,
      type: 3,
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
      show: false,
      active: false,
      pro: true,
      type: 3,
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
      show: false,
      active: false,
      pro: true,
      type: 3,
    },
    {
      img: "/images/teams-icon.svg",
      icon: "/images/teams-icon.svg",
      title: "Teams",
      description: " Include your website URL to enhance your online presence",
      nickname: "Teams",
      url: "",
      realprefix: "https://",
      placeholder: "",
      infolabel: "Website URL",
      prefix: "https://",
      show: false,
      active: false,
      pro: true,
      type: 2,
    },
    {
      img: "/images/salla-icon.svg",
      icon: "/images/salla-icon.svg",
      title: "Salla",
      description: " Include your website URL to enhance your online presence",
      nickname: "Salla",
      url: "",
      realprefix: "https://",
      placeholder: "",
      infolabel: "Website URL",
      prefix: "https://",
      show: false,
      active: false,
      pro: true,
      type: 2,
    },
    {
      img: "/images/shopify-icon.svg",
      icon: "/images/shopify-icon.svg",
      title: "Shopify",
      description: " Include your website URL to enhance your online presence",
      nickname: "Shopify",
      url: "",
      realprefix: "https://",
      placeholder: "",
      infolabel: "Website URL",
      prefix: "https://",
      show: false,
      active: false,
      pro: true,
      type: 2,
    },
    {
      img: "/images/stcpay-icon.svg",
      icon: "/images/stcpay-icon.svg",
      title: "Stcpay",
      description: " Include your website URL to enhance your online presence",
      nickname: "Stcpay",
      url: "",
      realprefix: "https://",
      placeholder: "",
      infolabel: "Website URL",
      prefix: "https://",
      show: false,
      active: false,
      pro: true,
      type: 4,
    },
    {
      img: "/images/paypal-icon.svg",
      icon: "/images/paypal-icon.svg",
      title: "Paypal",
      description: " Include your website URL to enhance your online presence",
      nickname: "Paypal",
      url: "",
      realprefix: "https://",
      placeholder: "",
      infolabel: "Website URL",
      prefix: "https://",
      show: false,
      active: false,
      pro: true,
      type: 4,
    },
  ]
);
const showRange = ref<string[]>(['All', 'Free', 'Pro'])
const showRangeNumber = ref<number>(0)

const socialLinks_show = ref<Array<ILink>>([])
const socialLinks_active = ref<Array<ILink>>([])
const link = ref<string>("")
const website_id = ref<number>(0)
const businessName = ref<string>("")
const bioDescription = ref<string>("")
const avatarFilePath = ref<string>("")
const avatarPath = ref<string>("")
const linkStatus = ref<boolean>(false)
const textAreaHeight: Ref<number> = ref(100)
const createdSiteUrl = ref<string>("")
const componentKey = ref(0)
const signoutLoading = ref<boolean>(false)
const websiteLoading = ref<boolean>(false)
// For profile
const username = ref<string>("")
const email = ref<string>("")
const is_subscribed = ref<boolean>(false)
const photoPath_top = ref<string>("")
const hideBranding = ref<boolean>(false)
// For Edit site button
const editable = ref<boolean>(false)
const loading = ref<boolean>(true)

//Social Icon State
const showIconType = ref<number>(1)
const showIconRange = ref<number>(1)
//update link name on setting tab
const inValidLink = ref<boolean>(false)
const newLink = ref<string>("")
const linkValidationMessage = ref<string>("")

onMounted(() => {
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

  const viewSiteEditBtn: HTMLDivElement | null = document.querySelector('.viewSiteEditBtn');
  if (viewSiteEditBtn) {
    viewSiteEditBtn.addEventListener('click', () => {
      editable.value = !editable.value
    });
  }

  const addSocialLinksBtns: NodeListOf<Element> | null = document.querySelectorAll('.addSocialLinksBtn')
  if (addSocialLinksBtns) {
    addSocialLinksBtns.forEach(addSocialLinksBtn => {
      addSocialLinksBtn.addEventListener('click', () => {
        addSocialLinksBtns.forEach(initializeBtn => {
          initializeBtn.classList.remove('active')
        })
        addSocialLinksBtn.classList.add('active')
      });
    });
  }

  setTimeout(() => {
    initialize();
  }, 100)
})

if (route.query) {
  link.value = route.query.link as string
  newLink.value = link.value
}
else {
  navigateTo('/private/dashboard')
}

const initialize = async () => {
  const { data: website } = await useAsyncData('website', async () => {
    const { data } = await supabase
      .from('website')
      .select('*')
      .eq('link', link.value)
      .single()
    return data
  })
  if (website.value) {
    console.log((website.value as Website).available_use)
    if(!((website.value as Website).available_use ? (website.value as Website).available_use : false)) {
      navigateTo('/private/dashboard')
    }
    website_id.value = (website.value as Website).id ? (website.value as Website).id : 0
    businessName.value = (website.value as Website).name ? (website.value as Website).name : ""
    bioDescription.value = (website.value as Website).bio ? (website.value as Website).bio : ""
    avatarFilePath.value = (website.value as Website).avatarfilepath ? (website.value as Website).avatarfilepath : ""
    socialLinks_active.value = (website.value as Website).links ? (website.value as Website).links : []
    socialLinks.value = socialLinks.value.map(socialLink => (socialLinks_active.value).filter(({ title }) => socialLink.title === title).length > 0 ? ({ ...socialLink, active: true }) : socialLink)
    linkStatus.value = (website.value as Website).status ? (website.value as Website).status : false
    hideBranding.value = (website.value as Website).hideBranding ? (website.value as Website).hideBranding : false
    if (avatarFilePath.value)
      avatarPath.value = await avatarHelper.downloadAvatar(avatarFilePath.value);
  }
  else {
    navigateTo('/private/dashboard')
  }

  const { data: profile } = await useAsyncData('profile', async () => {
    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.value?.id)
      .single()
    return data
  })
  if (profile.value) {
    username.value = (profile.value as Profile).username ? (profile.value as Profile).username : ""
    email.value = (profile.value as Profile).email ? (profile.value as Profile).email : ""
    is_subscribed.value = (profile.value as Profile).is_subscribed ? (profile.value as Profile).is_subscribed : false
    photoPath_top.value = (profile.value as Profile).photo ? await photoHelper.downloadPhoto((profile.value as Profile).photo) : ''
  }
  showIconList(showIconType.value, showIconRange.value);
  loading.value = false
}

supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'profile' },
    async (payload) => {
      username.value = (payload.new as Profile).username
      photoPath_top.value = await photoHelper.downloadPhoto((payload.new as Profile).photo)
    }
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'website' },
    (payload) => {
      initialize()
    }
  )
  .subscribe()

function resizeTextArea(): void {
  const element: HTMLTextAreaElement | null = document.querySelector('textarea');
  if (element) {
    element.style.height = '100px';
    element.style.height = `${element.scrollHeight}px`;
    textAreaHeight.value = element.scrollHeight;
  }
}

const toggleActive = (index: number, title: string) => {
  console.log("this is toggle")
  //if (!(socialLinks_show.value[index].pro && !is_subscribed.value)) {
  socialLinks.value = socialLinks.value.map((socialLink, id) => index === id ? ({ ...socialLink, active: !socialLink.active }) : socialLink)
  //socialLinks_show.value = socialLinks_show.value.map((socialLink, id) => index === id ? ({ ...socialLink, active: !socialLink.active }) : socialLink)
  if(!(socialLinks.value[index].pro && !is_subscribed.value)) {
    if (socialLinks_active.value.filter(link => link.title === title).length > 0)
    socialLinks_active.value.splice(socialLinks_active.value.findIndex(link => link.title === title), 1);
  else
    socialLinks_active.value.push(socialLinks.value[index])
  }
  //}
}

const toggleBranding = async () => {
  loading.value = true
  const updateInfo = [{
    hideBranding: !hideBranding.value
  }]
  const { error } = await supabase
    .from('website')
    .update(updateInfo as never)
    .eq('link', link.value)
  await initialize();
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
    avatarfilepath: avatarFilePath.value,
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

const toggleLive = async (status: any) => {
  loading.value = true
  const updateInfo = [{
    status: !status
  }]
  const { error } = await supabase
    .from('website')
    .update(updateInfo as never)
    .eq('link', link.value)
  await initialize();
  //loading.value = false;
}

const linkValidation = async () => {
  if (newLink.value === "") {
    inValidLink.value = true
    linkValidationMessage.value = "Please enter linkname"
    return
  }
  const regex = /[ `!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
  if (regex.test(newLink.value)) {
    inValidLink.value = true
    linkValidationMessage.value = "Linknames can only include letters, numbers, underscores ( _ ) and dash ( - )"
    return
  }
  let { data: website } = await supabase
    .from('website')
    .select('*')
    .eq('link', newLink.value)
  if (website?.length != 0) {
    inValidLink.value = true
    linkValidationMessage.value = "That linkname is already taken"
    return
  }
  else {
    inValidLink.value = false
    return
  }
}

const updateLink = async () => {
  await linkValidation()
  if (inValidLink.value) return
  loading.value = true
  const updateInfo = [{
    link: newLink.value
  }]
  const { error } = await supabase
    .from('website')
    .update(updateInfo as never)
    .eq('id', website_id.value)
  if (error) {
    //loading.value = false
    alert(error.message)
  }
  else {
    navigateTo(`/private/edit?link=${newLink.value}`)
  }
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

const changeTab = (tabNum: number) => {
  const overviewTabElement = document.querySelector('#overviewTab');
  const analyticsTabElement = document.querySelector('#analyticsTab');
  const siteSettingsTabElement = document.querySelector('#siteSettingsTab');
  const middleSection = document.querySelector('#middleSection');
  const analyticsSection = document.querySelector('#analyticsSection');
  const settingSection = document.querySelector('#settingSection');
  if (tabNum === 1) {
    overviewTabElement?.setAttribute("class", "font16 font600 active")
    analyticsTabElement?.setAttribute("class", "font16 font600")
    siteSettingsTabElement?.setAttribute("class", "font16 font600")
    middleSection?.setAttribute("class", "middleSection")
    analyticsSection?.setAttribute("class", "AnalyticsSection d-none")
    settingSection?.setAttribute("class", "SettingSection d-none")
  } else
    if (!is_subscribed.value) {
      console.log(document.querySelector('#upgradeToProModal'));
      const upgradeToProModal: HTMLElement | null = document.querySelector('#upgradeToProModal')
      if (upgradeToProModal) {
        upgradeToProModal.style.display = 'block';
        setTimeout(() => {
          upgradeToProModal.classList.add('show');
        }, 200)
      }
    } else if (tabNum === 2) {
      overviewTabElement?.setAttribute("class", "font16 font600")
      analyticsTabElement?.setAttribute("class", "font16 font600 active")
      siteSettingsTabElement?.setAttribute("class", "font16 font600")
      middleSection?.setAttribute("class", "middleSection d-none")
      analyticsSection?.setAttribute("class", "AnalyticsSection")
      settingSection?.setAttribute("class", "SettingSection d-none")
    } else if (tabNum === 3) {
      overviewTabElement?.setAttribute("class", "font16 font600")
      analyticsTabElement?.setAttribute("class", "font16 font600")
      siteSettingsTabElement?.setAttribute("class", "font16 font600 active")
      middleSection?.setAttribute("class", "middleSection d-none")
      analyticsSection?.setAttribute("class", "AnalyticsSection d-none")
      settingSection?.setAttribute("class", "SettingSection")
    }
}

const closeUpgradeToProModal = () => {
  const upgradeToProModal: HTMLElement | null = document.querySelector('#upgradeToProModal')
  if (upgradeToProModal) {
    upgradeToProModal.classList.remove('show');
    setTimeout(() => {
      upgradeToProModal.style.display = 'none';
    }, 1000)
  }
}

const showIconList = (iconType: number, rangeType: number) => {
  if (rangeType == 1) {
    socialLinks.value.map(socialLink => {
      if (socialLink.type == iconType) {
        socialLink.show = true
      } else {
        socialLink.show = false
      }
    })
  }
  if (rangeType == 2) {
    socialLinks.value.map(socialLink => {
      if (socialLink.type == iconType && !socialLink.pro) {
        socialLink.show = true
      } else {
        socialLink.show = false
      }
    })
  }
  if (rangeType == 3) {
    socialLinks.value.map(socialLink => {
      if (socialLink.type == iconType && socialLink.pro) {
        socialLink.show = true
      } else {
        socialLink.show = false
      }
    })
  }
  showRangeNumber.value = rangeType - 1
  showIconType.value = iconType;
  showIconRange.value = rangeType;
}

const deleteSite = async () => {
  const { error } = await supabase
    .from('website')
    .delete()
    .eq('link', link.value)
  console.log(error);
  const data = new FormData();
  data.append('delete_condition', `linkTo='${link.value}'`);
  await fetch(
      "https://api.tinybird.co/v0/datasources/demo_custom_data_2766/delete",
      {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer p.eyJ1IjogIjA3MTAwYzlhLTg5NTMtNGE5ZC05Mzc2LWNkNzhiNjI2OTQ4YSIsICJpZCI6ICJmNGE3MTJhYi0yZThkLTQxOWItOGMyMS1kMTdkNDY2YmUyOWQiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.aydPss0TH0Yq3q7_eB7pf9x2rP_DxpcXt_LiM4N4tPg`,
          'Content-Type': 'application/json',
        },
      }
    )
  navigateTo('/private/dashboard')
}

</script>

<template>
  <main>
    <div class="headBannerSection">
      <div class="headerMain">
        <div class="container">
          <div class="headerBox d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <a href="/">
                <img src="/images/logo-icon.svg" alt="" />
              </a>
              <div class="sweplyMenu respoHide">
                <ul>
                  <li>
                    <a href="/private/dashboard">
                      <svg width="24" class="mr12" height="24" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_921_7540)">
                          <path
                            d="M9.30253 5.71047C9.69253 6.10047 9.69253 6.73047 9.30253 7.12047L5.42253 11.0005H20.5925C21.1425 11.0005 21.5925 11.4505 21.5925 12.0005C21.5925 12.5505 21.1425 13.0005 20.5925 13.0005H5.41253L9.29253 16.8805C9.68253 17.2705 9.68253 17.9005 9.29253 18.2905C8.90253 18.6805 8.27253 18.6805 7.88253 18.2905L2.29253 12.7005C1.90253 12.3105 1.90253 11.6805 2.29253 11.2905L7.89253 5.71047C8.27253 5.32047 8.91253 5.32047 9.30253 5.71047Z"
                            fill="#F5F8FF" />
                        </g>
                        <defs>
                          <clipPath id="clip0_921_7540">
                            <rect width="24" height="24" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      Dashboard
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="sweplyMenu respoHide overAnalyticsMenu">
              <ul>
                <li><a id="overviewTab" class="font16 font600 active" @click="changeTab(1)"> Overview </a></li>
                <li><a id="analyticsTab" class="font16 font600" @click="changeTab(2)">Analytics
                    <span>Pro</span></a></li>
                <li><a id="siteSettingsTab" class="font16 font600" @click="changeTab(3)">Site Settings
                    <span>Pro</span></a></li>
              </ul>
            </div>
            <div class="profileDropdownMain">
              <ul class="d-flex align-items-center" style="gap: 8px;">
                <li>
                  <a class="claimBtn mr16 bg-white" data-bs-toggle="modal" data-bs-target="#linkShareModal">
                    <svg width="20" class="mr8" height="20" viewBox="0 0 20 20" fill="none"
                      xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M17.5 10V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V10M13.3333 5.83333L10 2.5M10 2.5L6.66667 5.83333M10 2.5V12.5"
                        stroke="#333B4A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    Share
                  </a>
                </li>
                <li class="headerProfileDropDown">
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle d-flex align-items-center" type="button"
                      data-bs-toggle="dropdown" aria-expanded="false">
                      <img v-if="photoPath_top === ''" src="/images/user-icon.svg" alt="" />
                      <img v-if="photoPath_top !== ''" :src=photoPath_top alt="" />
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item pointer">
                          <div class="dropdownProfileName font600">
                            {{ username }}
                          </div>
                          <div class="dropdownProfileEmail">
                            {{ email }}
                          </div>
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item pointer" v-bind:class="{ 'disabled': signoutLoading }" @click="signOut">
                          <svg width="16" class="mr8" height="16" viewBox="0 0 16 16" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M10.6667 11.3333L14 8M14 8L10.6667 4.66667M14 8H6M6 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.7157 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.07989 2 5.2V10.8C2 11.9201 2 12.4802 2.21799 12.908C2.40973 13.2843 2.71569 13.5903 3.09202 13.782C3.51984 14 4.0799 14 5.2 14H6"
                              stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                          {{ signoutLoading ? 'Loading' : 'Log out' }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
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
                <li><a href="">Overview</a></li>
                <li><a href="">Analytics</a></li>
                <li><a href="">Site Settings</a></li>
                <li>
                  <a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut">
                    {{ signoutLoading ? 'Loading' : 'Log out' }}
                  </a>
                </li>
              </ul>
            </div>
            <div class="menuIcon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="middleSection" class="middleSection">
      <div class="viewSiteMain">
        <div class="d-flex justify-content-between align-items-center viewSiteHeadingMain">
          <div class="viewSiteHeadding">
            <div class="d-flex align-items-center mb-1">
              <div class="viewSiteHead font600">
                {{ link }}
              </div>
              <div class="switchBtn">
                <label class="switch">
                  <input type="checkbox" :checked="linkStatus" @click="toggleLive(linkStatus)">
                  <span class="slider slider-round"></span>
                </label>
              </div>
            </div>
            <div class="d-flex">
              <div class="siteContentTxtURL">
                treepixel.app/<span>{{ link }}</span>
              </div>
              <div v-if="linkStatus" class="statusLive"> Live </div>
              <div v-else class="statusPause">Paused</div>
            </div>
          </div>
          <div class="viewSiteEditBtn pointer">
            <a class="claimBtn bg-white rounded-3">
              <svg width="20" class="mr8" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.39668 15.0963C2.43497 14.7517 2.45411 14.5794 2.50624 14.4184C2.55249 14.2755 2.61784 14.1396 2.70051 14.0142C2.79369 13.8729 2.91627 13.7503 3.16142 13.5052L14.1667 2.49992C15.0871 1.57945 16.5795 1.57945 17.5 2.49993C18.4205 3.4204 18.4205 4.91279 17.5 5.83326L6.49475 16.8385C6.2496 17.0836 6.12702 17.2062 5.98572 17.2994C5.86035 17.3821 5.72439 17.4474 5.58152 17.4937C5.42048 17.5458 5.24819 17.5649 4.90362 17.6032L2.08331 17.9166L2.39668 15.0963Z"
                  stroke="#333B4A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span>{{ editable ? "Close" : "Edit site" }}</span>
            </a>
          </div>
        </div>
      </div>
      <div class="mainSection" :class="editable ? '' : 'mainSection-plus'">
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
                <UploadAvatar v-model:path="avatarPath"
                  @update:avatarFilePath="($event: string) => avatarFilePath = $event" />
              </div>
            </div>
          </div>
          <div class="stepOneSection stepTwoSection">
            <div class="stepTitle">
              <h3 class="font16 font700 mb0">2. Link your social profiles</h3>
              <p class="colorGrey mb0">Redirect your audience to the below social media profile pages</p>
            </div>
            <div class="d-flex align-items-center justify-content-between addSocialLinksMain">
              <div class="addSocialLinks rounded-3 d-flex align-items-center">
                <div class="addSocialLinksBtn rounded-2 font600 active" @click="showIconList(1, showIconRange)">
                  General
                </div>
                <div class="addSocialLinksBtn rounded-2 font600" @click="showIconList(2, showIconRange)">
                  Business <span class="proSpan">Pro</span>
                </div>
                <div class="addSocialLinksBtn rounded-2 font600" @click="showIconList(3, showIconRange)">
                  Restaurants
                </div>
                <div class="addSocialLinksBtn rounded-2 font600" @click="showIconList(4, showIconRange)">
                  Payments <span class="proSpan">Pro</span>
                </div>
              </div>
              <div class="addSocialLinksDropDown">
                <div class="dropdown">
                  <button class="btn btn-secondary dropdown-toggle d-flex align-items-center bg-white text-black"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {{ showRange[showRangeNumber] }} <i class="fal fa-angle-down"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li>
                      <a class="dropdown-item" @click="showIconList(showIconType, 1)">
                        {{ showRange[0] }}
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" @click="showIconList(showIconType, 2)">
                        {{ showRange[1] }}
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item d-flex justify-content-between" @click="showIconList(showIconType, 3)">
                        {{ showRange[2] }}
                        <svg width="16" class="ml8" height="16" viewBox="0 0 16 16" fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <rect width="16" height="16" rx="8" fill="#0A0A0A" />
                          <path
                            d="M8.00005 11.5134L10.7667 13.1867C11.2734 13.4934 11.8934 13.04 11.76 12.4667L11.0267 9.32005L13.4734 7.20005C13.92 6.81338 13.68 6.08005 13.0934 6.03338L9.87338 5.76005L8.61338 2.78671C8.38672 2.24671 7.61338 2.24671 7.38671 2.78671L6.12671 5.75338L2.90672 6.02671C2.32005 6.07338 2.08005 6.80671 2.52672 7.19338L4.97338 9.31338L4.24005 12.46C4.10672 13.0334 4.72672 13.4867 5.23338 13.18L8.00005 11.5134Z"
                            fill="#C4FF57" />
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="allSocialSection">
              <div v-for="(socialLink, id) in socialLinks" :key="id" :active="socialLink.active">
                <div class="socialIconBx" v-if="socialLink.show">
                  <img :src="socialLink.img" alt="icon" @click="toggleActive(id, socialLink.title)" class="pointer"
                    height="48" />
                  <div v-if="socialLink.pro == true && is_subscribed == false" class="addplusBx pointer" size="20">
                    <img src="/images/star-icon.svg" alt="plus" />
                  </div>
                  <div v-else class="addplusBx pointer" size="20" @click="toggleActive(id, socialLink.title)">
                    <i v-if="socialLink.active" class="mdi mdi-minus" alt="minus"></i>
                    <img v-else src="/images/plus-icon.svg" alt="plus" />
                  </div>
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
            <button class="launchSiteBtn font700 font16" :disabled="!businessName.trim()" data-bs-toggle="modal"
              data-bs-target="#ConfirmLaunchModal">
              <img src="/images/icon-map.svg" alt="user" />
              Launch site</button>
            <button type="button" class="btn btn-primary d-none" id="openModal" data-bs-toggle="modal"
              data-bs-target="#launchSiteModal"></button>
          </div>
          <div class="mobilePreviewSection text-center">
            <h2 class="font16 font700">
              Website preview
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
    </div>

    <div id="analyticsSection" class="AnalyticsSection d-none">
      <Analytics :link="link" />
    </div>

    <div id="settingSection" class="SettingSection d-none">
      <div class="middleSection siteSettingPage">
        <div>
          <h2 class="siteSettingTitle d-inline">Site settings:</h2>
          <a class="btn bg-danger text-white float-right" @click="deleteSite()">Delete Site</a>
        </div>
        <div class="siteInfoSection">
          <h2>Site info</h2>
          <div class="siteStatusSection d-flex justify-content-between">
            <div class="siteTitleTxt">
              Site status
              <span v-if="linkStatus" class="statusLive">Live</span>
              <span v-else class="statusPause">Paused</span>
            </div>
            <div class="switchBtn">
              <label class="switch">
                <input type="checkbox" :checked="linkStatus" @click="toggleLive(linkStatus)">
                <span class="slider slider-round"></span>
              </label>
            </div>
          </div>
          <div class="SiteUserNameBox">
            <h3>Site username</h3>
            <div class="mb-3 form-group">
              <label for="text" class="form-label">Business name</label>
              <input type="text" class="form-control" name="text" v-model="newLink" @input="linkValidation()"
                @blur="linkValidation()" />
              <span class="leftTxtInput">treepixel.app/</span>
              <button class="inputSaveBtn" type="button" @click="updateLink()">Save</button>
            </div>
            <span v-if="inValidLink" class="error-message">{{ linkValidationMessage }}</span>
          </div>
          <div class="siteStatusSection d-flex justify-content-between brandingRemoveBox">
            <div class="siteTitleTxt">
              Remove Treepixel branding
            </div>
            <div class="switchBtn">
              <label class="switch">
                <input type="checkbox" :checked="hideBranding" id="removeTreePixelBranding" @click="toggleBranding()">
                <span class="slider slider-round"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="siteInfoSection">
          <h2>SEO <span class="titleSub">(search engine optimization)</span></h2>
          <div class="customMetadataBox">
            <div class="titleCustomMeta">
              <h3>Custom metadata</h3>
              <p>Any changes you add in metadata may take a while to refresh.</p>
            </div>
            <h5 class="labelImgTitle">Label image</h5>
            <div class="labelImageSection">
              <span><svg width="41" height="40" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0.468262" width="40" height="40" rx="20" fill="#F5F6FA" />
                  <path
                    d="M17.135 23.3333L20.4683 20M20.4683 20L23.8017 23.3333M20.4683 20V27.5M27.135 23.9524C28.1529 23.1117 28.8017 21.8399 28.8017 20.4167C28.8017 17.8854 26.7496 15.8333 24.2183 15.8333C24.0362 15.8333 23.8659 15.7383 23.7734 15.5814C22.6867 13.7374 20.6804 12.5 18.385 12.5C14.9332 12.5 12.135 15.2982 12.135 18.75C12.135 20.4718 12.8312 22.0309 13.9575 23.1613"
                    stroke="#333B4A" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <div class="uploadText"><a href="#">Click to upload</a> or drag and drop</div>
              <p class="mb-0">PNG, JPG or GIF (max. 1200x630px)</p>
            </div>
            <div class="form-group">
              <label for="text" class="form-label">Meta title</label>
              <input type="text" class="form-control" placeholder="Enter Meta title" name="text" />
              <span class="charactersTxt">0/70 characters</span>
            </div>
            <div class="form-group mb-3">
              <label for="text" class="form-label">Meta (Description)</label>
              <input type="text" class="form-control" placeholder="Enter Meta title" name="text" />
              <span class="charactersTxt">23/120 characters</span>
            </div>
          </div>
        </div>
        <div class="siteInfoSection">
          <h2>Analytics integrations</h2>
          <div class="customMetadataBox">
            <div class="titleCustomMeta">
              <h3>Custom metadata</h3>
            </div>

            <div class="facebookInputBox">
              <h4>Facebook</h4>
              <div class="form-group">
                <label for="text" class="form-label">Pixel ID</label>
                <input type="text" class="form-control" placeholder="Enter Pixel ID" name="text" />
              </div>
              <div class="form-group mb-3">
                <label for="text" class="form-label">Facebook conversions API access token</label>
                <input type="text" class="form-control" placeholder="Enter Meta title" name="text" />
              </div>
            </div>
            <div class="facebookInputBox">
              <h4>Google</h4>
              <div class="form-group">
                <label for="text" class="form-label">Google measurement ID</label>
                <input type="text" class="form-control" placeholder="Enter Pixel ID" name="text" />
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

    <div v-if="loading" class="overlay" id="loadingSpinner">
      <div class="d-flex justify-content-center h-100 align-items-center">
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

    <div class="modal fade profileModal linkShareModal" id="linkShareModal" tabindex="-1" aria-labelledby="profileLabel"
      aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-body">
            <div class="shareLinkModalContent">
              <div class="shareLinkHead font600">
                Share your treepixel link
              </div>
              <div class="shareLinkDesc">
                Share it everywhere and get more visiters
              </div>
            </div>
            <div class="p-3">
              <div class="d-flex justify-content-between align-items-center projectLinkTree rounded-3">
                <div class="d-flex align-items-center">
                  <div class="mr8">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M9.30087 2.79412C9.687 2.40196 10.313 2.40196 10.6991 2.79412L12.7966 4.9245C13.1827 5.31666 13.1827 5.95254 12.7966 6.3447L10.6991 8.47507C10.313 8.86724 9.687 8.86724 9.30087 8.47507L7.20345 6.3447C6.81733 5.95254 6.81733 5.31666 7.20345 4.9245L9.30087 2.79412ZM4.05733 11.6706C5.02264 12.6511 6.58771 12.6511 7.55302 11.6706C8.51833 10.6902 8.51833 9.10053 7.55302 8.12005C6.58771 7.13958 5.02264 7.13958 4.05733 8.12005C3.09202 9.10053 3.09202 10.6902 4.05733 11.6706ZM12.447 11.6706C13.4123 12.6511 14.9774 12.6511 15.9427 11.6706C16.908 10.6902 16.908 9.10053 15.9427 8.12005C14.9774 7.13958 13.4123 7.13958 12.447 8.12005C11.4817 9.10053 11.4817 10.6902 12.447 11.6706ZM11.7479 12.3807C10.7825 11.4003 9.21747 11.4003 8.25216 12.3807C7.28685 13.3612 7.28685 14.9508 8.25216 15.9313C9.21747 16.9118 10.7825 16.9118 11.7479 15.9313C12.7132 14.9508 12.7132 13.3612 11.7479 12.3807Z"
                        fill="#141807" />
                    </svg>
                  </div>
                  <div class="userprojectLink">
                    treepixel.app/<span>{{ link }}</span>
                  </div>
                </div>
                <div class="">
                  <a href="">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_921_8882)">
                        <path
                          d="M10 13.3333H3.33333V4.66659C3.33333 4.29992 3.03333 3.99992 2.66667 3.99992C2.3 3.99992 2 4.29992 2 4.66659V13.3333C2 14.0666 2.6 14.6666 3.33333 14.6666H10C10.3667 14.6666 10.6667 14.3666 10.6667 13.9999C10.6667 13.6333 10.3667 13.3333 10 13.3333ZM13.3333 10.6666V2.66659C13.3333 1.93325 12.7333 1.33325 12 1.33325H6C5.26667 1.33325 4.66667 1.93325 4.66667 2.66659V10.6666C4.66667 11.3999 5.26667 11.9999 6 11.9999H12C12.7333 11.9999 13.3333 11.3999 13.3333 10.6666ZM12 10.6666H6V2.66659H12V10.6666Z"
                          fill="#6F7582" />
                      </g>
                      <defs>
                        <clipPath id="clip0_921_8882">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade profileModal" id="upgradeToProModal" tabindex="-1" aria-labelledby="profileLabel"
      style="display: none; padding-right: 17px;" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-6 font700" id="profileLabel">Upgrade to Pro to unlock this feature!</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
              @click="closeUpgradeToProModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3 fs-6">
              Get even more out of your experience! Upgrade to our Pro plan to unlock this awesome feature and take your
              journey to the next level!
            </div>
            <div class="text-end">
              <a class="claimBtn" href="/pricing">
                Upgrade
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>