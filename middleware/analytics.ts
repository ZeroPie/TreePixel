export default defineNuxtRouteMiddleware((to: any, from: any) => {
  console.log('to'+to);
  console.log('from'+from);
  // recordClick(to.path, from);
})
