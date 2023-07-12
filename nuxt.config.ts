// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  plugins: [{ src: '~/plugins/vercel.ts', mode: 'client' }],
  modules: [
    '@nuxtjs/supabase',
    '@unlok-co/nuxt-stripe'
  ],
  stripe: {
    publishableKey: 'pk_test_123',
    apiKey: 'sk_test_123'
  },
  imports: {
    dirs: [
      'utils'
    ]
  },
  css: [
    "vuetify/lib/styles/main.sass",
    "bootstrap/dist/css/bootstrap.min.css",
    "@/assets/css/threepixel.css",
    "@/assets/css/fontawesome-v5.7.2-pro.min.css",
    "@/assets/css/custom.css",
    "@/assets/css/sweplyInu.css",
    "@/assets/css/sweplyInu-new-oldd.css",
    "@/assets/css/responsive.css",
  ],
  build: {
    transpile: ['vuetify'],
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
  },
  app: {
    head: {
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css' }
      ],
      script: [
        {
          hid: 'gtmHead',
          innerHTML: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PR33SX8');`,
        },
        {
          src: "https://code.jquery.com/jquery-3.3.1.slim.min.js",
          type: "text/javascript"
        },
        {
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js",
          type: "text/javascript"
        },
        {
          src:
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js",
          type: "text/javascript",
          crossorigin: "anonymous",
          integrity: "sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
        }
      ]
    }
  },
})
