<script lang="ts" setup>
import { ref, defineAsyncComponent, computed } from 'vue';
import Locations from './Locations.vue';
import Devices from './Devices.vue';
import Referrer from './referrer.vue';
import { toNumber } from '@vue/shared';

const ApexCharts = defineAsyncComponent(() => import("vue3-apexcharts"));
const props = defineProps(['link']);

const categories = ref<string[]>([]);
const series = ref([
    {
        name: "Visit",
        data: [],
    },
]);

let chartTerm = ref("Last 24 hours");
let totalVisitied = ref(0);
const link = props.link ? props.link : '';
let prevState: any = null;

function formatDate(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function subtractFixedTime(date: any, durationInMilliseconds: any) {
    const currentTime = date.getTime();
    const newTime = currentTime - durationInMilliseconds;
    date.setTime(newTime);
}

function formatDateForLast24Hours(date: any) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        hour12: true,
    });
}

function formatDateForLastDays(date: any) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function formatDateForLast3Months(date: any) {
    return date.toLocaleString('en-US', {
        month: 'short',
    });
}

function setLast24HoursAxios(xAxios: any, yAxios: any, from: any, response: any) {
    totalVisitied.value = 0;
    for (let i = 0; i < 24; i++) {
        const offset = new Date().getTimezoneOffset() * 60000;
        console.log("offset", offset, from.value)
        xAxios.push(formatDateForLast24Hours(new Date(from.value - offset)));
        let total = 0;
        response.data.map((m: any) => {
            if (m["HOUR(date)"] === from.value.getHours()) {
                total = total + m["count()"];
            }
        })
        totalVisitied.value = totalVisitied.value + total;
        yAxios.push(total);
        from.value.setHours(from.value.getHours() + 1);
    }
}

function setLast7daysAxios(xAxios: any, yAxios: any, from: any, response: any) {
    totalVisitied.value = 0;
    for (let i = 0; i < 7; i++) {
        const offset = new Date().getTimezoneOffset() * 60000;
        xAxios.push(formatDateForLastDays(new Date(from.value - offset)));
        let total = 0;
        response.data.map((m: any) => {
            if (m["DAY(date)"] === from.value.getDate()) {
                total = total + m["count()"];
            }
        })
        totalVisitied.value = totalVisitied.value + total;
        yAxios.push(total);
        from.value.setDate(from.value.getDate() + 1);
    }
}

function setLast30daysAxios(xAxios: any, yAxios: any, from: any, response: any) {
    totalVisitied.value = 0;
    for (let i = 0; i < 30; i++) {
        const offset = new Date().getTimezoneOffset() * 60000;
        xAxios.push(formatDateForLastDays(new Date(from.value - offset)));
        let total = 0;
        response.data.map((m: any) => {
            if (m["DAY(date)"] === from.value.getDate()) {
                total = total + m["count()"];
            }
        })
        totalVisitied.value = totalVisitied.value + total;
        yAxios.push(total);
        from.value.setDate(from.value.getDate() + 1);
    }
}

function setLast3monthsAxios(xAxios: any, yAxios: any, from: any, response: any) {
    totalVisitied.value = 0;
    for (let i = 0; i < 3; i++) {
        const offset = new Date().getTimezoneOffset() * 60000;
        from.value.setMonth(new Date(from.value - offset).getMonth() + 1);
        xAxios.push(formatDateForLast3Months(from.value));
        let total = 0;
        response.data.map((m: any) => {
            if (m["MONTH(date)"] === from.value.getMonth() + 1) {
                total = total + m["count()"];
            }
        })
        totalVisitied.value = totalVisitied.value + total;
        yAxios.push(total);
    }
}

const fetchData = () => {
    let fromDateTime = ref(new Date());
    let subTime: any;
    const controller = new AbortController();
    // setTimeout(() => controller.abort(), 4900);
    // const options = { timeout: 4900 };

    const url = new URL(`https://api.tinybird.co/v0/pipes/click_by_hour_pipe.json`);
    url.searchParams.append('linkTo', link ? link : '');
    switch (chartTerm.value) {
        case 'Last 24 hours':
            subTime = 3600 * 1000 * 24;
            break;
        case 'Last 7 days':
            subTime = 3600 * 1000 * 24 * 6;
            break;
        case 'Last 30 days':
            subTime = 3600 * 1000 * 24 * 29;
            break;
        case 'Last 3 months':
            subTime = 3600 * 1000 * 24 * 89;
            break;
    }
    subtractFixedTime(fromDateTime.value, subTime);
    url.searchParams.append('dateParam', formatDate(fromDateTime.value));
    fetch(url, {
        headers: {
            Authorization: 'Bearer ' + process.env.TINYBIRD_CLICK_PIPE_KEY
        }
    })
        .then(r => r.json())
        .then(r => {
            if (r === prevState) return;
            prevState = r;
            categories.value = [];
            series.value[0].data = [];
            switch (chartTerm.value) {
                case 'Last 24 hours':
                    setLast24HoursAxios(categories.value, series.value[0].data, fromDateTime, r);
                    break;
                case 'Last 7 days':
                    setLast7daysAxios(categories.value, series.value[0].data, fromDateTime, r);
                    break;
                case 'Last 30 days':
                    setLast30daysAxios(categories.value, series.value[0].data, fromDateTime, r);
                    break;
                case 'Last 3 months':
                    setLast3monthsAxios(categories.value, series.value[0].data, fromDateTime, r);
                    break;
            }
        })
        .catch(e => e.toString());
};

onMounted(() => {
    fetchData();
    // setInterval(() => {
    //     fetchData();
    // }, 50000);
});

const chartOptions = computed(() => {
    return {
        chart: {
            id: 'vuechart-example'
        },
        yaxis: {
            labels: {
                formatter: function (value: string) {
                    const val = toNumber(value);
                    return (val * 10) % 10 == 0 ? val : '';
                }
            },
        },
        xaxis: {
            categories: categories.value,
            labels: {
                formatter: function (value: string) {
                    switch (chartTerm.value) {
                        case 'Last 24 hours':
                            return categories.value.indexOf(value) % 4 == 0 ? value : "";
                        case 'Last 7 days':
                            return value;
                        case 'Last 30 days':
                            return categories.value.indexOf(value) % 5 == 0 ? value : "";
                        case 'Last 3 months':
                            return value;
                    }
                }
            }
        },
    };
});

function handleChange(event: any) {
    chartTerm.value = event.target.value;
    fetchData();
}
</script>

<template>
    <div class="bg-gray-50 py-10">
        <div class="z-10 mb-5 top-[0rem] sticky bg-gray-50 py-3 sm:py-5 shadow-md">
            <div
                class="mx-auto flex max-w-4xl flex-col items-center justify-between space-y-3 px-2.5 md:flex-row md:space-y-0 lg:px-0">
                <p
                    class="group flex text-lg font-semibold text-gray-800 sm:text-xl">
                    treepixel.app/{{ link }}
                </p>
                <div class="flex items-center">
                    <select class="p-2" @change="handleChange">
                        <option value="Last 24 hours" selected>Last 24 hours
                        </option>
                        <option value="Last 7 days">Last 7 days</option>
                        <option value="Last 30 days">Last 30 days</option>
                        <option value="Last 3 months">Last 3 months</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="mx-auto grid max-w-4xl gap-5">
            <div
                class="max-w-4xl border border-gray-200 bg-white p-5 sm:rounded-lg sm:border-gray-100 sm:p-10 sm:pr-20 sm:shadow-lg">
                <div class="mb-3 text-left">
                    <div class="flex items-end space-x-1">
                        <h1 class="text-3xl font-bold sm:text-4xl">
                            {{ totalVisitied }}
                        </h1>
                    </div>
                    <p class="text-sm font-medium uppercase text-gray-600">
                        Total Visited
                    </p>
                </div>
                <client-only>
                    <ApexCharts height="300" type="bar" :options="chartOptions"
                        :series="series"></ApexCharts>
                </client-only>
            </div>
            <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Locations :chartTerm="chartTerm" :link="link"
                    :totalVisitied="totalVisitied" />
                <Devices :chartTerm="chartTerm" :link="link"
                    :totalVisitied="totalVisitied" />
                <Referrer :chartTerm="chartTerm" :link="link"
                    :totalVisitied="totalVisitied" />
            </div>
        </div>
    </div>
</template>

<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;</style>
