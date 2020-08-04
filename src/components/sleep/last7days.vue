<template>
  <div class="Chart-Last7Days">
    <bar-chart :width="300" :height="500" :chart-data="sleepTimeChartData" :options="sleepTimeChartOptions"></bar-chart>
    <H3>평균 기상 시간 : {{avrWakeTime}}</H3>
    <h3>평균 취침 시간 : {{avrBedTime}}</h3>
    <bar-chart :width="300" :height="500" :chart-data="sleepAmountChartData"
               :options="sleepAmountChartOptions"></bar-chart>
    <h3>평균 수면 시간 : {{avrSleepAmount}}H</h3>
    <!--    horizontal-bar-chart disabled-->
    <horizontal-bar-chart v-if="false" width="700" :height="500" :chart-data="sleepTimeHorizontalChartData"
                          :options="sleepTimeHorizontalChartOptions"></horizontal-bar-chart>
  </div>
</template>

<script>
import BarChart from '../BarChart.js'
import EventBus from '../EventBus.js'
import HorizontalBarChart from "@/common/HorizontalBarChart";
import moment from 'moment'

var TIME_STRING_TYPE = {
  YESTERDAY: {value: -1,},
  TODAY: {value: 0},
  TOMORROW: {value: 1},
}

const IDEAL_BED_TIME = timeStringToMinutes("22:30")
const IDEAL_WAKE_TIME = timeStringToMinutes("05:00")
const IDEAL_SLEEP_AMOUNT = 6

function timeStringToMinutes(timeString, type = TIME_STRING_TYPE.TODAY) {
  var timeStringArray = timeString.split(':', 2);
  var hour = timeStringArray[0] * 1;
  var minute = timeStringArray[1] * 1;
  minute += (hour * 60);
  if (type === TIME_STRING_TYPE.YESTERDAY)
    minute -= (24 * 60)
  else if (type === TIME_STRING_TYPE.TOMORROW)
    minute += (24 * 60)
  return minute;
}

function minutesToHour(minutes) {
  minutes *= 1
  if (minutes < 0)
    minutes += (60 * 24);
  var hour = minutes / 60;
  return hour
}

function getSleepTimeData(yesterdaySleepTime, todaySleepTime) {
  var bedTime
  if (yesterdaySleepTime.bedTime >= '00:00' && yesterdaySleepTime.bedTime <= '12:00')
    bedTime = timeStringToMinutes(yesterdaySleepTime.bedTime)
  else
    bedTime = timeStringToMinutes(yesterdaySleepTime.bedTime, TIME_STRING_TYPE.YESTERDAY)
  var wakeTime = timeStringToMinutes(todaySleepTime.wakeTime)
  if (bedTime === wakeTime && bedTime == 0) {
    bedTime = NaN
    wakeTime = NaN
  }
  return [bedTime, wakeTime]
}

function getLabel(sleepTime) {
  var date = moment(sleepTime.date, "YYYY-MM-DD")
  return date.format("MM-DD ddd")
}

function getSleepAmountData(sleepTimeData) {
  var bedTime = sleepTimeData[0]
  var wakeTime = sleepTimeData[1]
  var sleepAmount = (wakeTime - bedTime) / 60
  return sleepAmount;
}

function sortSleepTimes(sleepTimes) {
  sleepTimes.sort((s1, s2) => {
    if (s1.date < s2.date)
      return -1;
    else if (s1.date > s2.date)
      return 1;
    return 0;
  })
}

function getAvrSleepAmount(sleepAmountData) {
  var avrSleepAmount = sleepAmountData.reduce((acc, sleepAmount) => {
    if (!isNaN(sleepAmount))
      acc += sleepAmount;
    return acc;
  });
  avrSleepAmount /= (sleepAmountData.filter(value => !isNaN(value)).length)
  avrSleepAmount = avrSleepAmount.toFixed(2);
  return avrSleepAmount;
}

function calcAvrBedOrWakeTime(times) {
  var avrTimes = times.filter(time=>!isNaN(time)).reduce((acc, time) => {
    acc += time
    return acc
  }, 0)

  avrTimes = avrTimes / 60 / times.filter(time => !isNaN(time)).length
  if (avrTimes < 0) {
    avrTimes += 24
  }
  avrTimes = Math.floor(avrTimes) + ':' + Math.floor(60 * (avrTimes % 1));
  return avrTimes
}

function getAvrBedTime(sleepTimeData) {
  var bedTimes = sleepTimeData.map(sleepTime => sleepTime[0])
  return calcAvrBedOrWakeTime(bedTimes)
}

function getAvrWakeTime(sleepTimeData) {
  var wakeTime = sleepTimeData.map(sleepTime => sleepTime[1])
  return calcAvrBedOrWakeTime(wakeTime)
}

export default {
  name: 'Last7Days',
  components: {
    BarChart,
    HorizontalBarChart
  },
  data() {
    return {
      avrWakeTime: "05:00",
      avrBedTime: "23:00",
      avrSleepAmount: "06:00",
      sleepTimeChartData: {},
      sleepTimeChartOptions: {},
      sleepAmountChartData: {},
      sleepAmountChartOptions: {},
      sleepTimeHorizontalChartData: {},
      sleepTimeHorizontalChartOptions: {}
    }
  },
  created() {
    EventBus.$on('EVT-DrawLast7DaysChart', this.drawLast7DaysChart)
  },
  mounted() {
  },
  computed: {},
  methods: {
    drawLast7DaysChart(sleepTimes) {
      sortSleepTimes(sleepTimes)
      var labels = []
      var sleepTimeData = []
      var sleepAmountData = []
      sleepTimes.forEach((sleepTime, i, sleepTimes) => {
        if (i != 0) {
          labels.push(getLabel(sleepTime))
          sleepTimeData.push(getSleepTimeData(sleepTimes[i - 1], sleepTimes[i]))
          sleepAmountData.push(getSleepAmountData(getSleepTimeData(sleepTimes[i - 1], sleepTimes[i])))
        }
      });

      this.avrBedTime = getAvrBedTime(sleepTimeData)
      this.avrWakeTime = getAvrWakeTime(sleepTimeData)
      this.avrSleepAmount = getAvrSleepAmount(sleepAmountData)

      // console.log(labels)
      // console.log(sleepTimeData)
      // console.log(sleepAmountData)
      this.drawLast7DaysSleepChart(labels, sleepTimeData);
      this.drawLast7DaysSleepAmountChart(labels, sleepAmountData);
      this.drawLast7DaysSleepHorizontalChart(labels, sleepTimeData);
    },
    drawLast7DaysSleepChart(labels, sleepTimeData) {
      this.sleepTimeChartData = {
        datasets: [
          {
            label: 'Sleep Times',
            backgroundColor: function () {
              var bgColor = new Array(7).fill('#72acda')
              var todayDay = moment().format('d') * 1
              bgColor = bgColor.map((value, index) => {
                var day = (index + todayDay + 1) % 7
                if (day === 0 || day === 6)
                  return '#d9d5ca'
                return value;
              })
              return bgColor;
            }(),
            data: sleepTimeData,
            yAxisID: 'SleepTime'
          }]
      }
      this.sleepTimeChartOptions = {
        tooltips: {
          displayColors: false,
          bodyFontStyle: 'bold',
          bodyFontSize: 14,
          callbacks: {
            label: (item) => {
              var value = item.value
              var bedTime = value.split(',')[0].replace("[", "") * 1
              var wakeTime = value.split(',')[1].replace("]", "") * 1
              var sleepTime = (wakeTime - bedTime) / 60

              var label = minutesToHour(bedTime)
              label += " ~ " + minutesToHour(wakeTime)
              label += " | " + sleepTime + "H"
              return label
            }
          }
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'category',
              labels: labels,
              position: 'bottom'
            }
          ],
          yAxes: [
            {
              id: 'SleepTime',
              type: 'linear',
              position: 'left',
              gridLines: {
                lineWidth: function () {
                  var min = -2  //Yesterday 22:00
                  var max = 8   //Today 8:00
                  var tickStep = 0.5
                  var numberOfTicks = (max - min) / tickStep
                  var lineWith = Array(numberOfTicks)
                  lineWith.fill(1)

                  var idealWakeTimeGridIndex = (max - IDEAL_WAKE_TIME / 60) / tickStep
                  lineWith[idealWakeTimeGridIndex] = 4 //IDEAL_WAKE_TIME grid line
                  var idealBedTimeGridIndex = 19 //Manually calc. FIXME if IDEAL_BED_TIME is changed.
                  lineWith[idealBedTimeGridIndex] = 4  // IDEAL_BED_TIME grid line
                  return lineWith
                }(),
              },
              ticks: {
                min: timeStringToMinutes('22:00', TIME_STRING_TYPE.YESTERDAY),
                max: timeStringToMinutes('08:00'),
                stepSize: 30,
                beginAtZero: false,
                callback: minutes => {
                  if (minutes < 0)
                    minutes += (60 * 24);
                  var tick = minutes;
                  if (tick != IDEAL_BED_TIME && tick != IDEAL_WAKE_TIME && (tick % 60) != 0)
                    return null;
                  tick /= 60
                  return tick
                }
              }
            }]
        }
      }
    },
    drawLast7DaysSleepAmountChart(labels, sleepAmountData) {
      this.sleepAmountChartData = {
        datasets: [
          {
            label: 'Amount of Sleep',
            data: sleepAmountData,
            backgroundColor: function () {
              var bgColor = new Array(7).fill('#72acda')
              sleepAmountData.map((value, index) => {
                if (value > IDEAL_SLEEP_AMOUNT) {
                  bgColor[index] = '#406c97'
                }
              })
              return bgColor
            }(),
            yAxisID: 'SleepAmount',
          }
        ]
      }
      this.sleepAmountChartOptions = {
        maintainAspectRatio: false,
        scales: {
          xAxes: [
            {
              type: 'category',
              labels: labels,
              position: 'bottom'
            }
          ],
          yAxes: [
            {
              id: 'SleepAmount',
              display: true,
              type: 'linear',
              position: 'left',
              gridLines: {
                lineWidth: function () {
                  var min = 0
                  var max = 11
                  var numberOfTicks = (max - min)
                  var lineWith = Array(numberOfTicks)
                  lineWith.fill(1)

                  var idealSleepAmountIndex = max - IDEAL_SLEEP_AMOUNT
                  lineWith[idealSleepAmountIndex] = 4
                  return lineWith
                }(),
              },
              ticks: {
                min: 0,
                max: 11,
                stepSize: 1,
                beginAtZero: true,
              }
            },
          ]
        }
      }
    },
    drawLast7DaysSleepHorizontalChart(labels, sleepTimeData) {
      this.sleepTimeHorizontalChartData = {
        datasets: [
          {
            label: 'Sleep Times',
            backgroundColor: function () {
              var bgColor = new Array(7).fill('#72acda')
              var todayDay = moment().format('d') * 1
              bgColor = bgColor.map((value, index) => {
                var day = (index + todayDay + 1) % 7
                if (day === 0 || day === 6)
                  return '#d9d5ca'
                return value;
              })
              return bgColor;
            }(),
            data: sleepTimeData,
            xAxisID: 'SleepTime'
          }]
      }
      this.sleepTimeHorizontalChartOptions = {
        tooltips: {
          displayColors: false,
          bodyFontStyle: 'bold',
          bodyFontSize: 14,
          callbacks: {
            label: (item) => {
              var value = item.value
              var bedTime = value.split(',')[0].replace("[", "") * 1
              var wakeTime = value.split(',')[1].replace("]", "") * 1
              var sleepTime = (wakeTime - bedTime) / 60

              var label = minutesToHour(bedTime)
              label += " ~ " + minutesToHour(wakeTime)
              label += " | " + sleepTime + "H"
              return label
            }
          }
        },
        maintainAspectRatio: false,
        responsive: false,
        scales: {
          yAxes: [
            {
              type: 'category',
              labels: labels,
              position: 'bottom'
            }
          ],
          xAxes: [
            {
              id: 'SleepTime',
              type: 'linear',
              position: 'left',
              gridLines: {
                lineWidth: function () {
                  var min = -2  //Yesterday 22:00
                  var max = 8   //Today 8:00
                  var tickStep = 0.5
                  var numberOfTicks = (max - min) / tickStep
                  var lineWith = Array(numberOfTicks)
                  lineWith.fill(1)

                  var idealWakeTimeGridIndex = 1 //Manually calc. FIXME if IDEAL_WAKE_TIME is changed.
                  lineWith[idealWakeTimeGridIndex] = 4 //IDEAL_WAKE_TIME grid line
                  var idealBedTimeGridIndex = 14 //Manually calc. FIXME if IDEAL_BED_TIME is changed.
                  lineWith[idealBedTimeGridIndex] = 4  // IDEAL_BED_TIME grid line
                  return lineWith
                }(),
              },
              ticks: {
                min: timeStringToMinutes('22:00', TIME_STRING_TYPE.YESTERDAY),
                max: timeStringToMinutes('08:00'),
                stepSize: 30,
                beginAtZero: false,
                callback: minutes => {
                  if (minutes < 0)
                    minutes += (60 * 24);
                  var tick = minutes;
                  if (tick != IDEAL_BED_TIME && tick != IDEAL_WAKE_TIME && (tick % 60) != 0)
                    return null;
                  tick /= 60
                  return tick
                }
              }
            }]
        }
      }
    },
  }
}
</script>

<style scoped>
  .box {
    float: left;
    width: 150px;
    height: 150px;
    margin-right: 30px;
  }

</style>
