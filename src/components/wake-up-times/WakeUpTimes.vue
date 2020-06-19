<template>
    <div class="WakeUpTimes">
        <GetWakeUpTime></GetWakeUpTime>
        <ChartWake></ChartWake>
    </div>
</template>

<script>
import moment from 'moment'
import EventBus from '@/components/EventBus'
import GetWakeUpTime from './GetWakeUpTime'
import ChartWake from './WakeChart'
import axios from 'axios'

export default {
    data: () => ({wakeData: {}}),
    components: {
        'GetWakeUpTime': GetWakeUpTime,
        'ChartWake': ChartWake,
    },
    methods: {
        registerEvent(eventName, cb) {
            EventBus.$on(eventName, cb)
        },
        loadWakeData() {
            var days = Array.from(Array(7).keys()).sort(function (a, b) {
                return b - a;
            }).map((key) => {
                return moment().subtract(key, 'days').format('YYYY[-]MM[-]DD')
            });

            this.wakeData = days.reduce((acc, day) => {
                var baseurl = "http://127.0.0.1:8080/v1.0/sleep?date=";
                var url = baseurl + day
                axios.get(url).then((response) => {
                    var time = response.data['time'];
                    this.wakeData[day] = time;
                    EventBus.$emit('EVT-WakeData', this.wakeData);
                }).catch((error) => {
                    console.log(error);
                })
                acc[day] = localStorage.getItem(day);
                return acc
            }, {});
            console.log("endOfloadWakeData");
        },
        handleEnterWake(date, time) {
            var url = "http://127.0.0.1:8080/v1.0/sleep";
            axios.post(url, {
                "date": date,
                "time": time,
            }).then((response) => {
                console.log(response)
            }).catch((error) => {
                console.log(error)
            })
            localStorage.setItem(date, time);
            if (date in this.wakeData) {
                this.wakeData[date] = time;
                EventBus.$emit('EVT-WakeData', this.wakeData);
            }
        }
    },
    created() {
        this.registerEvent('EVT-GetWakeUpTime', this.handleEnterWake);
    },
    mounted() {
        this.loadWakeData();
        EventBus.$emit('EVT-WakeData', this.wakeData);
    }
}
</script>
