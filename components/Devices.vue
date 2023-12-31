<template>
    <div class="relative z-0 h-[420px] overflow-scroll border border-gray-200 bg-white px-7 py-5 scrollbar-hide  sm:rounded-lg sm:border-gray-100 sm:shadow-lg">
        <div class="mb-5 flex justify-between">
            <h1 class="text-xl font-semibold">Devices</h1>
            <div class="relative inline-flex items-center space-x-3">
                <button
                    v-for="button in buttons"
                    :key="button"
                    :class="{
                        'bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md px-2 py-1 text-sm font-medium capitalize transition-all duration-75 active:scale-90 sm:px-3': true, 
                        'bg-gray-100 text-gray-800 rounded-md px-2 py-1 text-sm font-medium capitalize transition-all duration-75 active:scale-90 sm:px-3': selected === button
                    }"
                    @click="selectButton(button)"
                >
                    {{ button }}
                </button>
            </div>
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
                        <DeviceIcon
                            :tab = "selected"
                            :display="res.data"
                        >
                        </DeviceIcon>
                        <p class="text-sm text-gray-800">{{ res.data }}</p>
                    </span>
                    <div 
                        class="absolute h-8 origin-left bg-green-100"
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
import DeviceIcon from './device-icon.vue';

let totalVisited = ref(0);
const buttons = ['Device', 'Browser', 'Os', 'Bot'];
const selected = ref('Device');
let result: any = ref(null);
let url: any, auth: any, resStr: any;

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

    switch(selected.value) {
        case 'Device':
            url = new URL(`https://api.tinybird.co/v0/pipes/device_pipe.json`)
            auth = 'Bearer ' + process.env.TINYBIRD_DEVICE_PIPE_KEY
            resStr = 'device'
            break;
        case 'Browser':
            url = new URL(`https://api.tinybird.co/v0/pipes/browser_pipe.json`)
            auth = 'Bearer ' + process.env.TINYBIRD_BROWSER_PIPE_KEY
            resStr = 'browser'
            break;
        case 'Os':
            url = new URL(`https://api.tinybird.co/v0/pipes/os_pipe.json`)
            auth = 'Bearer ' + process.env.TINYBIRD_OS_PIPE_KEY
            resStr = 'os'
            break;
        case 'Bot':
            url = new URL(`https://api.tinybird.co/v0/pipes/bot_pipe.json`)
            auth = 'Bearer ' + process.env.TINYBIRD_BOT_PIPE_KEY
            resStr = 'bot'
            break;
    }

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
                data: m[resStr],
                count: m['count()']
            }
        })
    })
    .catch (e => e.toString())
}

const selectButton = (button: string) => {
    selected.value = button === selected.value ? '' : button;
    fetchData();
};

onMounted(() => {
    fetchData();
    // setInterval(() => {
    //     fetchData();
    // }, 50000);
});

</script>
  
<style scoped>
    .active {
        background-color: #007bff;
        color: #fff;
    }

@tailwind base;
@tailwind components;
@tailwind utilities;
</style>