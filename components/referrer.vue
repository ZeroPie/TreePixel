<template>
    <div class="relative z-0 h-[420px] overflow-scroll border border-gray-200 bg-white px-7 py-5 scrollbar-hide sm:rounded-lg sm:border-gray-100 sm:shadow-lg">
        <div class="mb-5 flex">
            <h1 class="text-xl font-semibold">Referrers</h1>
        </div>
        <div
            :class="{
                'grid gap-4': result && result.length > 0, 
                'flex h-[300px] items-center justify-center': !(result && result.length > 0)
            }"
        >
            <div
                v-for="res in result"
                :key="res"
                class="flex items-center justify-between"
            >
                <div class="relative z-10 flex w-full max-w-[calc(100%-3rem)] items-center">
                    <span class="z-10 flex items-center space-x-2 px-2">
                        <p class="text-sm text-gray-800">{{ res.data }}</p>
                    </span>
                    <div 
                        class="absolute h-8 origin-left bg-red-100"
                        :style="getWidthStyle(res)"
                    ></div>
                </div>
                <p class="z-10 text-sm text-gray-600">
                    {{ res.count }}
                </p>
            </div>
        </div>
    </div>
</template>
  
<script lang="ts" setup>

import { ref } from 'vue';

let result: any = ref(null);
let url: any, auth: any, resStr: any;
let totalVisited = ref(0);

const props = defineProps(['chartTerm', 'link']);
watch(() => props.chartTerm, fetchData)

function getWidthStyle(res: any) {
    return `width: ${res.count/totalVisited.value * 100}%`;
}

function subtractFixedTime(date: any, durationInMilliseconds: any) {
  const currentTime = date.getTime();
  const newTime = currentTime - durationInMilliseconds;
  date.setTime(newTime);
}

function formatDate(date: any) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function fetchData() {
    let fromDateTime = ref(new Date());
    let subTime : any;

    url = new URL(`https://api.tinybird.co/v0/pipes/referrer_pipe.json`)
    auth = 'Bearer ' + process.env.TINYBIRD_REFERRER_PIPE_KEY
    resStr = 'referrer'

    url.searchParams.append('linkTo', props.link ? props.link: '');

    switch(props.chartTerm) {
        case 'Last 24 hours':
            subTime = 3600 * 1000 * 24;
            break;
        case 'Last 7 days':
            subTime = 3600 * 1000 * 24 * 7;
            break;
        case 'Last 30 days':
            subTime = 3600 * 1000 * 24 * 30;
            break;
        case 'Last 3 months':
            subTime = 3600 * 1000 * 24 * 90;
            break;
    }
    subtractFixedTime(fromDateTime.value, subTime);
    url.searchParams.append('dateParam', formatDate(fromDateTime.value));

    fetch(url, {
        headers: {
            Authorization: auth
        }
    })
    .then (r => r.json())
    .then (r => {
        totalVisited.value = 0;
        result.value = r.data.map((m: any) => {
            totalVisited.value = totalVisited.value + m['count()']
            return {
                data: m[resStr].includes("tree") && m[resStr].includes("pixel") ? "(direct)" : m[resStr],
                count: m['count()']
            }
        })
    })
    .catch (e => e.toString())
}

onMounted(() => {
    fetchData();
    // setInterval(() => {
    //     fetchData();
    // }, 50000);
});

</script>
  
<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>