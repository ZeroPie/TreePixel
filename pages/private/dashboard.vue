<script lang="ts" setup>
definePageMeta({
  middleware: 'auth'
})
interface Profile {
  username: string;
  email: string;
  is_subscribed: boolean;
  interval: string;
  current_period_end: Date;
  photo: string;
}

interface Website {
  id: number;
  link: string;
  status: boolean;
  available_use: boolean;
}

const photoHelper = usePhotoHelper()

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const supabaseAuth = useSupabaseAuthClient()

const profileLoading = ref<boolean>(false)
const signoutLoading = ref<boolean>(false)
const loading = ref<boolean>(true);

const username = ref<string>("")
const email = ref<string>("")
const websites = ref<Array<Website>>([])
const newLink = ref<string>("")
const website_id = ref<number>(0)
const inValidLink = ref<boolean>(false)
const linkValidationMessage = ref<string>("")
const availableUpdateProfile = ref<boolean>(false);
// For test
const is_subscribed = ref<boolean>(false)
const interval = ref<string>('')
const current_period_end = ref<Date | null>()

//FileUpload
const filePath = ref<string>("")
const photoPath = ref<string>("")
const photoPath_top = ref<string>("")

supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'profile' },
    async (payload) => {
      interval.value = (payload.new as Profile).interval
      is_subscribed.value = (payload.new as Profile).is_subscribed
      current_period_end.value = (payload.new as Profile).current_period_end
      username.value = (payload.new as Profile).username
      photoPath_top.value = await photoHelper.downloadPhoto((payload.new as Profile).photo)
      photoPath.value = await photoHelper.downloadPhoto((payload.new as Profile).photo)
      filePath.value = (payload.new as Profile).photo ? (payload.new as Profile).photo : ''
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
  setTimeout(() => {
    initialize();
  }, 100)
});

const initialize = async () => {
  const { data: profile } = await useAsyncData('profile', async () => {
    profileLoading.value = true
    const { data } = await supabase
      .from('profile')
      .select('*')
      .eq('id', user.value?.id)
      .single()
    profileLoading.value = false
    return data
  })
  if (profile.value) {
    username.value = (profile.value as Profile).username ? (profile.value as Profile).username : ""
    email.value = (profile.value as Profile).email ? (profile.value as Profile).email : ""
    is_subscribed.value = (profile.value as Profile).is_subscribed ? (profile.value as Profile).is_subscribed : false
    interval.value = (profile.value as Profile).interval ? (profile.value as Profile).interval : ""
    current_period_end.value = (profile.value as Profile).current_period_end ? (profile.value as Profile).current_period_end : null
    photoPath_top.value = (profile.value as Profile).photo ? await photoHelper.downloadPhoto((profile.value as Profile).photo): ''
    photoPath.value = (profile.value as Profile).photo ? await photoHelper.downloadPhoto((profile.value as Profile).photo): ''
    filePath.value = (profile.value as Profile).photo ? (profile.value as Profile).photo : ''
    const { data: website } = await useAsyncData('website', async () => {
      const { data } = await supabase
        .from('website')
        .select('id, link, status, available_use')
        .eq('user_id', user.value?.id)
        .order('id', { ascending: true })
      return data
    })
    if (website.value) {
      websites.value = website.value as Array<Website>
    }
  }
  loading.value = false
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

const createNewSite = async () => {
  loading.value = true
  const { data: websiteNum } = (await supabase.from('website').select('*').eq('user_id', user.value?.id))
  if(websiteNum) {
    if(is_subscribed.value) {
      if(websiteNum.length >= 5) {
        window.alert('The website account is limited.')
        loading.value = false
        const cancelButtonOfModal: HTMLButtonElement | null = document.querySelector('.onenWebsiteBtn');
        cancelButtonOfModal?.click()
        return
      }
    } else {
      if(websiteNum.length >= 1) {
        window.alert('If you buy Pro Plan, you can use more websites.')
        const cancelButtonOfModal: HTMLButtonElement | null = document.querySelector('.onenWebsiteBtn');
        cancelButtonOfModal?.click()
        loading.value = false
        return
      }
    }
  }
  await linkValidation()
  if (inValidLink.value) return
  const websiteInfo = [{
    user_id: user.value?.id,
    link: newLink.value,
  }]
  let { error: error2 } = await supabase.from('website').insert(websiteInfo as never[])
  //await initialinitialize();
  const cancelButtonOfModal: HTMLButtonElement | null = document.querySelector('.onenWebsiteBtn');
  cancelButtonOfModal?.click()
  goToEdit(newLink.value)
};

const openUpdateLinkModal = async (website: any) => {
  newLink.value = website.link
  website_id.value = website.id
};

const updateLink = async () => {
  loading.value = true
  await linkValidation()
  if (inValidLink.value) return
  const updateInfo = [{
    link: newLink.value
  }]
  const { error } = await supabase
    .from('website')
    .update(updateInfo as never)
    .eq('id', website_id.value)
  await initialize();
  const cancelButtonOfModal: HTMLButtonElement | null = document.querySelector('.updateCancelWebsiteBtn');
  cancelButtonOfModal?.click()
}

const updateProfile = async () => {
  availableUpdateProfile.value = true
  const updateInfo= [{
    username: username.value,
    photo: filePath.value,
  }]
  const { error } = await supabase
    .from('profile')
    .update(updateInfo as never)
    .eq('id', user.value?.id)
  const cancelButtonOfModal: HTMLButtonElement | null = document.querySelector('.up');
  cancelButtonOfModal?.click()
  initialize()
}

const goToEdit = (link: string) => {
  navigateTo(`/private/edit?link=${link}`)
};

const formatNewLink = () => {
  newLink.value = ""
  linkValidationMessage.value = ""
};

const deleteLink = async (website: any) => {
  loading.value = true
  const { error } = await supabase
    .from('website')
    .delete()
    .eq('id', website.id)
  console.log('delete start')
  console.log('delete end')
  await initialize()
}
const viewLink = (website: any) => {
  const url = `${window.location.origin}/${website.link}`
  window.open(url, '_blank');
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

const toggleLive = async (website: any) => {
  loading.value = true
  const updateInfo = [{
    status: !website.status
  }]
  const { error } = await supabase
    .from('website')
    .update(updateInfo as never)
    .eq('id', website.id)
  await initialize();
}

const handleResetPassword = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
    alert("Check your email to update password");
  } catch (error: any) {
    alert(error.error_description || error.message);
  } finally {
    loading.value = false;
  }
};

const deletePhoto = () => {
  photoPath.value = ''
  filePath.value = ''
}
</script>

<template>
  <div class="headBannerSection">
    <div class="headerMain">
      <div class="container">
        <div class="headerBox d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <a href="/">
              <img src="/images/logo.svg" alt="" />
            </a>
            <div class="sweplyMenu respoHide">
              <ul>
                <li><a href="/"> Home </a></li>
                <li><a href="/private/dashboard">Dashboard</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a target="_blank" href="https://sweply.com/">Discover Sweply</a></li>
              </ul>
            </div>
          </div>
          <div class="profileDropdownMain">
            <ul class="d-flex align-items-center">
              <li v-if="!is_subscribed" class="respoHide"><a class="claimBtn mr16" href="/pricing">🔥 Upgrade to PRO</a></li>
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
                      <a class="dropdown-item pointer" data-bs-toggle="modal" data-bs-target="#profileModal">
                        <svg width="16" class="mr8" height="16" viewBox="0 0 16 16" fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <g clip-path="url(#clip0_883_15922)">
                            <path
                              d="M7.99998 9.99992C9.10455 9.99992 9.99998 9.10449 9.99998 7.99992C9.99998 6.89535 9.10455 5.99992 7.99998 5.99992C6.89541 5.99992 5.99998 6.89535 5.99998 7.99992C5.99998 9.10449 6.89541 9.99992 7.99998 9.99992Z"
                              stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path
                              d="M12.4848 9.8181C12.4042 10.0009 12.3801 10.2037 12.4157 10.4003C12.4514 10.5969 12.5451 10.7783 12.6848 10.9211L12.7212 10.9575C12.8339 11.0701 12.9233 11.2038 12.9843 11.3509C13.0453 11.4981 13.0767 11.6558 13.0767 11.8151C13.0767 11.9744 13.0453 12.1321 12.9843 12.2792C12.9233 12.4264 12.8339 12.5601 12.7212 12.6726C12.6086 12.7853 12.4749 12.8748 12.3278 12.9357C12.1806 12.9967 12.0229 13.0281 11.8636 13.0281C11.7043 13.0281 11.5466 12.9967 11.3994 12.9357C11.2523 12.8748 11.1186 12.7853 11.006 12.6726L10.9697 12.6363C10.8268 12.4966 10.6454 12.4028 10.4488 12.3672C10.2522 12.3315 10.0494 12.3556 9.86665 12.4363C9.68739 12.5131 9.53452 12.6407 9.42683 12.8033C9.31915 12.9659 9.26136 13.1564 9.26059 13.3514V13.4545C9.26059 13.7759 9.13288 14.0842 8.90556 14.3116C8.67825 14.5389 8.36994 14.6666 8.04846 14.6666C7.72699 14.6666 7.41868 14.5389 7.19137 14.3116C6.96405 14.0842 6.83634 13.7759 6.83634 13.4545V13.3999C6.83165 13.1993 6.76672 13.0048 6.64999 12.8416C6.53325 12.6783 6.37012 12.554 6.1818 12.4848C5.999 12.4041 5.79623 12.38 5.59962 12.4157C5.40302 12.4513 5.2216 12.545 5.07877 12.6848L5.0424 12.7211C4.92983 12.8338 4.79615 12.9232 4.649 12.9842C4.50185 13.0452 4.34412 13.0766 4.18483 13.0766C4.02554 13.0766 3.86781 13.0452 3.72066 12.9842C3.57351 12.9232 3.43983 12.8338 3.32725 12.7211C3.21455 12.6086 3.12515 12.4749 3.06415 12.3277C3.00315 12.1806 2.97175 12.0228 2.97175 11.8636C2.97175 11.7043 3.00315 11.5465 3.06415 11.3994C3.12515 11.2522 3.21455 11.1186 3.32725 11.006L3.36362 10.9696C3.50334 10.8268 3.59706 10.6454 3.63271 10.4488C3.66836 10.2522 3.64429 10.0494 3.56362 9.86659C3.48679 9.68733 3.35923 9.53445 3.19663 9.42677C3.03403 9.31909 2.84349 9.2613 2.64846 9.26052H2.54543C2.22396 9.26052 1.91565 9.13282 1.68834 8.9055C1.46102 8.67819 1.33331 8.36988 1.33331 8.0484C1.33331 7.72693 1.46102 7.41862 1.68834 7.1913C1.91565 6.96399 2.22396 6.83628 2.54543 6.83628H2.59998C2.80058 6.83159 2.99513 6.76666 3.15834 6.64993C3.32155 6.53319 3.44587 6.37006 3.51513 6.18174C3.59581 5.99894 3.61987 5.79617 3.58422 5.59956C3.54858 5.40296 3.45485 5.22154 3.31513 5.07871L3.27877 5.04234C3.16607 4.92977 3.07666 4.79609 3.01566 4.64894C2.95467 4.50179 2.92327 4.34406 2.92327 4.18477C2.92327 4.02548 2.95467 3.86775 3.01566 3.7206C3.07666 3.57345 3.16607 3.43976 3.27877 3.32719C3.39134 3.21449 3.52502 3.12509 3.67217 3.06409C3.81932 3.00309 3.97705 2.97169 4.13634 2.97169C4.29563 2.97169 4.45336 3.00309 4.60051 3.06409C4.74766 3.12509 4.88135 3.21449 4.99392 3.32719L5.03028 3.36356C5.17312 3.50327 5.35453 3.597 5.55114 3.63265C5.74774 3.6683 5.95052 3.64423 6.13331 3.56355H6.1818C6.36105 3.48673 6.51393 3.35916 6.62161 3.19656C6.72929 3.03396 6.78708 2.84343 6.78786 2.6484V2.54537C6.78786 2.2239 6.91556 1.91559 7.14288 1.68827C7.3702 1.46096 7.67851 1.33325 7.99998 1.33325C8.32145 1.33325 8.62976 1.46096 8.85708 1.68827C9.0844 1.91559 9.2121 2.2239 9.2121 2.54537V2.59992C9.21288 2.79494 9.27067 2.98548 9.37835 3.14808C9.48603 3.31068 9.63891 3.43824 9.81816 3.51507C10.001 3.59575 10.2037 3.61981 10.4003 3.58416C10.5969 3.54852 10.7784 3.45479 10.9212 3.31507L10.9576 3.27871C11.0701 3.16601 11.2038 3.0766 11.351 3.0156C11.4981 2.9546 11.6558 2.92321 11.8151 2.92321C11.9744 2.92321 12.1322 2.9546 12.2793 3.0156C12.4265 3.0766 12.5601 3.16601 12.6727 3.27871C12.7854 3.39128 12.8748 3.52496 12.9358 3.67211C12.9968 3.81926 13.0282 3.97699 13.0282 4.13628C13.0282 4.29557 12.9968 4.4533 12.9358 4.60045C12.8748 4.7476 12.7854 4.88128 12.6727 4.99386L12.6363 5.03022C12.4966 5.17306 12.4029 5.35447 12.3673 5.55108C12.3316 5.74768 12.3557 5.95045 12.4363 6.13325V6.18174C12.5132 6.36099 12.6407 6.51387 12.8033 6.62155C12.9659 6.72923 13.1565 6.78702 13.3515 6.7878H13.4545C13.776 6.7878 14.0843 6.9155 14.3116 7.14282C14.5389 7.37014 14.6666 7.67844 14.6666 7.99992C14.6666 8.32139 14.5389 8.6297 14.3116 8.85702C14.0843 9.08433 13.776 9.21204 13.4545 9.21204H13.4C13.205 9.21282 13.0144 9.27061 12.8518 9.37829C12.6892 9.48597 12.5617 9.63885 12.4848 9.8181Z"
                              stroke="#344054" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                          </g>
                          <defs>
                            <clipPath id="clip0_883_15922">
                              <rect width="16" height="16" fill="white" />
                            </clipPath>
                          </defs>
                        </svg>
                        Profile Settings
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
              <li><a href="/pricing">Pricing</a></li>
              <li><a target="_blank" href="https://sweply.com/">Discover Sweply</a></li>
              <li><a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut">
                  {{ signoutLoading ? 'Loading' : 'Log out' }}
                </a></li>
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
  <div class="dashMain">
    <div class="container">
      <div>
        <div class='container'>
          <div class='dashPageHead'>
            Welcome back
          </div>
          <div class='createBtnMain'>
            <button data-bs-toggle="modal" data-bs-target="#createModal"
              class='createNewSiteButton d-flex justify-content-center align-items-center' @click="formatNewLink()">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.99996 4.16666V15.8333M4.16663 9.99999H15.8333" stroke="#6FA439" stroke-width="1.66667"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Create new site
            </button>
          </div>
          <div class='sitesMainSection'>
            <div class='sitesHeade'>
              My sites
            </div>
            <div class='sitesListSection d-flex align-items-center'>
              <template v-for="(website, id) in websites" :key="id">
                <div :class="website.available_use ? 'sitesListSectionCol': 'sitesListSectionCol mainSection-plus'">
                  <div class='siteContentTxt'>
                    <div class="statusOffSection">
                      <div v-if="website.status" class="statusLive"> Live </div>
                      <div v-else class="statusPause">Paused</div>
                      <div class="switchBtn">
                        <label class="switch">
                          <input type="checkbox" :checked="website.status" @click="toggleLive(website)">
                          <span class="slider slider-round"></span>
                        </label>
                      </div>
                    </div>
                    <div class='siteContentTxtLeft'>
                      <div class='siteContentTxtURL'>
                        treepixel.app/<span>{{ website.link }}</span>
                      </div>
                      <div class='siteContentTxtHeading'>
                        {{ website.link }}
                      </div>
                    </div>
                    <!-- <div class='siteContentTxtDropdown dropend'>
                      <button type="button" class="btn" data-bs-toggle="dropdown">
                        <i class="fal fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li v-if="website.status" class="text-center"><button class="dropdown-item"
                            @click="viewLink(website)">View</button></li>
                        <li class="text-center"><button class="dropdown-item" @click="openUpdateLinkModal(website)"
                            data-bs-toggle="modal" data-bs-target="#updateModal">Rename</button></li>
                        <li class="text-center"><button class="dropdown-item" @click="deleteLink(website)">Delete</button>
                        </li>
                      </ul>
                    </div> -->
                    <div class='siteContentTxtEdit'>
                      <button @click="goToEdit(website.link)">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M2.39662 15.0964C2.43491 14.7518 2.45405 14.5795 2.50618 14.4185C2.55243 14.2756 2.61778 14.1396 2.70045 14.0142C2.79363 13.8729 2.91621 13.7504 3.16136 13.5052L14.1666 2.49999C15.0871 1.57951 16.5795 1.57951 17.4999 2.49999C18.4204 3.42046 18.4204 4.91285 17.4999 5.83332L6.49469 16.8386C6.24954 17.0837 6.12696 17.2063 5.98566 17.2995C5.86029 17.3821 5.72433 17.4475 5.58146 17.4937C5.42042 17.5459 5.24813 17.565 4.90356 17.6033L2.08325 17.9167L2.39662 15.0964Z"
                            stroke="#6FA439" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade createWebsiteModal" id="createModal" tabindex="-1" aria-labelledby="createModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class='websiteReadyContent text-center'>
            <div class='text-center'>
              <div class='createWebsiteHead'>
                Create a new website
              </div>
              <div class='createWebsiteDesc'>
                Choose your Treepixel username. you can always change it later
              </div>
            </div>
            <div class='createWebsiteform position-relative'>
              <input type='text' name='website name' class='form-control createWebsiteInput' v-model="newLink"
                @input="linkValidation()" @blur="linkValidation()" />
              <span class='position-absolute inputLableTxt'>treepixel.app/</span>
            </div>
            <span v-if="inValidLink" class="error-message">{{ linkValidationMessage }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button variant="primary" class='onenWebsiteBtn' data-bs-dismiss="modal">
            Cancel
          </button>
          <button variant="secondary" class='doneBtn' @click="createNewSite()">
            Create
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade updateWebsiteModal" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class='websiteReadyContent text-center'>
            <div class='text-center'>
              <div class='createWebsiteHead'>
                Change your website linkname
              </div>
              <div class='createWebsiteDesc'>
                Change your linkname. you can always change it later
              </div>
            </div>
            <div class='createWebsiteform position-relative'>
              <input type='text' name='website name' class='form-control createWebsiteInput' v-model="newLink"
                @input="linkValidation()" @blur="linkValidation()" />
              <span class='position-absolute inputLableTxt'>treepixel.app/</span>
            </div>
            <span v-if="inValidLink" class="error-message">{{ linkValidationMessage }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button variant="primary" class='updateCancelWebsiteBtn' data-bs-dismiss="modal">
            Cancel
          </button>
          <button variant="secondary" class='doneBtn' @click="updateLink()">
            Change
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade profileModal" id="profileModal" tabindex="-1" aria-labelledby="profileLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-6 font700" id="profileLabel">Profile settings</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex align-items-end justify-content-between userPlanDetails p-3">
            <div class="userPlanNameDesc">
              <div class="userPlanName text-white">
                {{is_subscribed ? 'Pro Plan' : 'Free Plan'}}
                <span class="rounded-4 font500 font14 ml8">Active</span>
              </div>
              <div class="userPlanDesc">
                Our most popular plan for small teams.
              </div>
            </div>
            <div class="userPlanUpgradeBtn">
              <a v-if="!is_subscribed" class="claimBtn" href="/pricing">Upgrade</a>
              <div v-else class="text-white" style="font-size: 25px;">
                {{ interval === 'month' ? '9$/month' : '35$/year' }}
              </div>
            </div>
          </div>
          <div class="profilePicUploadMain mb24">
            <div class="profilePicHead font500 mb8">
              Your photo
            </div>
            <UploadPhoto v-model:path="photoPath" @update:filePath="$event => filePath = $event" @remove:path="deletePhoto()"/>
          </div>
          <div class="form-group mb24">
            <label for="fname">User name</label>
            <input type="text" class="form-control" v-model="username">
          </div>
          <div class="form-group mb24">
            <label for="fname">Email address</label>
            <div class="position-relative inputIconAdded">
              <input type="text" class="form-control" :value="email" disabled>
              <span class="emailIcon position-absolute">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.66663 5.83337L8.47073 10.5962C9.0217 10.9819 9.29719 11.1748 9.59685 11.2495C9.86154 11.3154 10.1384 11.3154 10.4031 11.2495C10.7027 11.1748 10.9782 10.9819 11.5292 10.5962L18.3333 5.83337M5.66663 16.6667H14.3333C15.7334 16.6667 16.4335 16.6667 16.9683 16.3942C17.4387 16.1545 17.8211 15.7721 18.0608 15.3017C18.3333 14.7669 18.3333 14.0668 18.3333 12.6667V7.33337C18.3333 5.93324 18.3333 5.23318 18.0608 4.6984C17.8211 4.22799 17.4387 3.84554 16.9683 3.60586C16.4335 3.33337 15.7334 3.33337 14.3333 3.33337H5.66663C4.26649 3.33337 3.56643 3.33337 3.03165 3.60586C2.56124 3.84554 2.17879 4.22799 1.93911 4.6984C1.66663 5.23318 1.66663 5.93324 1.66663 7.33337V12.6667C1.66663 14.0668 1.66663 14.7669 1.93911 15.3017C2.17879 15.7721 2.56124 16.1545 3.03165 16.3942C3.56643 16.6667 4.26649 16.6667 5.66663 16.6667Z"
                    stroke="#6F7582" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>
          </div>
          <div class="d-flex justify-content-between align-items-center modalActionBtns">
            <div class="forgotPlanBillBtns d-flex align-items-center">
              <div class="mr24" data-bs-toggle="modal" data-bs-target="#resetPasswordModal">
                Forget password
              </div>
              <div class="profilePlanBillBtn">
                <a href="/private/plan-billing">
                  Plan & billing
                </a>
              </div>
            </div>
            <div class="">
              <button class="claimBtn" href="#" data-bs-dismiss="modal"  aria-label="Close" @click="updateProfile()">Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade profileModal" id="resetPasswordModal" tabindex="-1" aria-labelledby="profileLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-6 font700" id="profileLabel">Reset your password</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="form-group mb24">
            <label for="fname">Email address</label>
            <div class="position-relative inputIconAdded">
              <input type="text" class="form-control" :value="email" disabled>
              <span class="emailIcon position-absolute">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.66663 5.83337L8.47073 10.5962C9.0217 10.9819 9.29719 11.1748 9.59685 11.2495C9.86154 11.3154 10.1384 11.3154 10.4031 11.2495C10.7027 11.1748 10.9782 10.9819 11.5292 10.5962L18.3333 5.83337M5.66663 16.6667H14.3333C15.7334 16.6667 16.4335 16.6667 16.9683 16.3942C17.4387 16.1545 17.8211 15.7721 18.0608 15.3017C18.3333 14.7669 18.3333 14.0668 18.3333 12.6667V7.33337C18.3333 5.93324 18.3333 5.23318 18.0608 4.6984C17.8211 4.22799 17.4387 3.84554 16.9683 3.60586C16.4335 3.33337 15.7334 3.33337 14.3333 3.33337H5.66663C4.26649 3.33337 3.56643 3.33337 3.03165 3.60586C2.56124 3.84554 2.17879 4.22799 1.93911 4.6984C1.66663 5.23318 1.66663 5.93324 1.66663 7.33337V12.6667C1.66663 14.0668 1.66663 14.7669 1.93911 15.3017C2.17879 15.7721 2.56124 16.1545 3.03165 16.3942C3.56643 16.6667 4.26649 16.6667 5.66663 16.6667Z"
                    stroke="#6F7582" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
            </div>
          </div>
          <a class="btnsweply pointer" @click="handleResetPassword()" v-bind:class="{ disabled: loading }">{{ loading ?
            "Loading" : "Reset password" }}</a>
          <div class="text-center">
          </div>
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
</template>
