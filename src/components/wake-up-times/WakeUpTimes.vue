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
                acc[day] = localStorage.getItem(day);
                return acc
            }, {});
        },
        handleEnterWake(date, time) {
            localStorage.setItem(date, time);
            if (date in this.wakeData) {
                this.wakeData[date] = time;
                EventBus.$emit('EVT-WakeData', this.wakeData);
            }
        }
    },
    created() {
        this.loadWakeData();
        this.registerEvent('EVT-GetWakeUpTime', this.handleEnterWake);
    },
    mounted() {
        EventBus.$emit('EVT-WakeData', this.wakeData);
    }
}
</script>
