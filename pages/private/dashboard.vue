<script lang="ts" setup>
// definePageMeta({
//   middleware: 'auth'
// })

interface Profile {
  username: string;
  email: string;
}

interface Website {
  id: number;
  link: string;
  status: boolean;
}

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
    if (!user.value) {
      return navigateTo('/auth/log-in')
    } else {
      initialize();
    }
  }, 2000)
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
    const { data: website } = await useAsyncData('website', async () => {
      const { data } = await supabase
        .from('website')
        .select('id, link, status')
        .eq('user_id', user.value?.id)
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
  await linkValidation()
  if (inValidLink.value) return
  const websiteInfo = [{
    user_id: user.value?.id,
    link: newLink.value,
  }]
  let { error: error2 } = await supabase.from('website').insert(websiteInfo as never[])
  await initialize();
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

const goToEdit = (link: string) => {
  const url = `${window.location.origin}/private/edit?link=${link}`
  window.open(url, '_blank');
};

const formatNewLink = () => {
  newLink.value = ""
  linkValidationMessage.value = ""
}

const deleteLink = async (website: any) => {
  loading.value = true
  const { error } = await supabase
    .from('website')
    .delete()
    .eq('id', website.id)
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
</script>

<template>
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
              <li><a v-bind:class="{ 'disabled': signoutLoading }" @click="signOut">
                  {{ signoutLoading ? 'Loading' : 'Log out' }}
                </a></li>
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
  <div class="dashMain">
    <div class="container">
      <div>
        <div class='container'>
          <div class='dashPageHead'>
            Welcome back, {{ username }}
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
                <div class='sitesListSectionCol'>
                  <div class='siteContentTxt'>
                    <div class="statusOffSection">
                      <div v-if="website.status" class="statusLive"> Live </div>
                      <div v-else class="statusPause">Paused</div>
                      <div class="switchBtn">
                        <label class="switch">
                          <input type="checkbox" :checked="website.status" @click="toggleLive(website)">
                          <span class="slider"></span>
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
                    <div class='siteContentTxtDropdown dropend'>
                      <button type="button" class="btn" data-bs-toggle="dropdown">
                        <i class="fal fa-ellipsis-v"></i>
                      </button>
                      <ul class="dropdown-menu">
                        <li v-if="website.status" class="text-center"><button class="dropdown-item" @click="viewLink(website)">View</button></li>
                        <li class="text-center"><button class="dropdown-item" @click="openUpdateLinkModal(website)" data-bs-toggle="modal"
                            data-bs-target="#updateModal">Rename</button></li>
                        <li class="text-center"><button class="dropdown-item" @click="deleteLink(website)">Delete</button></li>
                      </ul>
                    </div>
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
  <div v-if="loading" class="overlay" id="loadingSpinner">
    <div class="d-flex justify-content-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem; z-index: 20;">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>
