<template>
  <div class="SleepTimes">
    <Last7Days></Last7Days>
  </div>
</template>

<script>
import Last7Days from './last7days'
import EventBus from '@/components/EventBus'
import moment from 'moment'

import {SleepTimeService} from "@/common/api.service"


export default {
  name: "Sleep",
  components: {
    'Last7Days': Last7Days
  },
  created() {
  },
  mounted() {
    var today = moment().format('YYYY[-]MM[-]DD')
    SleepTimeService.getLast7Days(today).then(response => {
      EventBus.$emit('EVT-DrawLast7DaysChart', response.data)
    })
    /*
        var sleepTimes = [
          {
            "date": "2020-07-01",
            "wakeTime": "07:30",
            "bedTime": "00:00"
          },
          {
            "date": "2020-07-02",
            "wakeTime": "08:00",
            "bedTime": "00:00",
          },
          {
            "date": "2020-07-03",
            "wakeTime": "06:00",
            "bedTime": "23:00",
          },
          {
            "date": "2020-07-04",
            "wakeTime": "07:00",
            "bedTime": "00:00",
          },
          {
            "date": "2020-07-05",
            "wakeTime": "08:00",
            "bedTime": "01:00",
          },
          {
            "date": "2020-07-06",
            "wakeTime": "08:30",
            "bedTime": "02:00",
          },
          {
            "date": "2020-07-07",
            "wakeTime": "08:40",
            "bedTime": "03:00",
          },
          {
            "date": "2020-07-08",
            "wakeTime": "09:00",
            "bedTime": "04:00",
          },
        ]
        EventBus.$emit('EVT-DrawLast7DaysChart', sleepTimes)
        */
  }
}
</script>

<style scoped>

</style>