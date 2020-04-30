<template>
  <div class="ChartWake">
    <v-container id="ChartWake">
      <bar-chart :width="300" :height="400" :chart-data="chartdata" :options="chartoptions"></bar-chart>
    </v-container>
  </div>
</template>

<script>
import BarChart from '../BarChart.js'
import EventBus from '../EventBus.js'
import moment from 'moment'

export default {
    name: 'WakeChart',
    components: {
        BarChart
    },
    data() {
        return {
            labels: [],
            showWeekend: false,
            wakeupTimes: {},
            wakeupTimesWeekdays: {},
            convertedWakeupTimes: {},
            chartdata: null,
            chartoptions: {}
        }
    },
    created() {
        EventBus.$on('EVT-WakeData', this.handleWakeData);
        EventBus.$on('EVT-ChartData', this.handleWakeData);
    },
    mounted() {
    },
    computed: {},
    methods: {
        toggleWeekend(event) {
            this.showWeekend = event;
            this.fillData();
        },
        calcAverage() {
            var validWakeupTimes = Object.values(this.wakeupTimes).filter(t => t);
            var average = validWakeupTimes.reduce((avr, t) => {
                avr += this.timeToNumeric(t);
                return avr;
            }, 0);
            average /= Object.keys(validWakeupTimes).length;
            return average;
        },
        getAverage() {
            var nr_data = Object.keys(this.wakeupTimes).length;
            var average = this.calcAverage();
            var averageArray = Array(nr_data);
            averageArray.fill(average, 0, nr_data);
            console.log(averageArray);
            return averageArray;
        },
        getLabels() {
            if (this.showWeekend)
                this.labels = Object.keys(this.wakeupTimes);
            else {
                this.labels = Object.keys(this.wakeupTimesWeekdays);
            }
            return this.labels;
        },
        timeToNumeric(time) {
            const baseTime = '1970-02-01 ';
            return moment(baseTime + time + ':00').valueOf();
        },
        numericToTime(numeric) {
            return moment.utc(numeric).local().format('hh:mm');
        },
        getData() {
            var d = {};
            if (this.showWeekend)
                d = this.wakeupTimes;
            else
                d = this.wakeupTimesWeekdays;
            this.convertedWakeupTimes = Object.values(d).map(t => {
                return this.timeToNumeric(t);
            });
            return this.convertedWakeupTimes;
        },
        handleWakeData(wakeData) {
            this.wakeupTimes = wakeData;
            this.wakeupTimesWeekdays = Object.entries(wakeData).filter(d => {
                if (moment(d[0]).weekday() != 0 && moment(d[0]).weekday() != 6) {
                    return d;
                }
            }).reduce((acc, d) => {
                acc[d[0]] = d[1];
                return acc;
            }, {});
            this.fillData();
        },
        fillData() {
            this.chartdata = {
                datasets: [
                    {
                        fill: false,
                        label: 'Average',
                        data: this.getAverage(),
                        borderColor: '#33ccff',
                        backgroundColor: '#33ccff',
                        type: 'line'
                    },
                    {
                        label: 'Wake Time',
                        backgroundColor: '#f87979',
                        data: this.getData(),
                    }
                ]
            };
            this.chartoptions = {
                tooltips: {
                    callbacks: {
                        label: item => {
                            return this.numericToTime(item.yLabel);
                        }
                    }
                },
                maintainAspectRatio: false,
                scales: {
                    xAxes: [
                        {
                            type: 'category',
                            labels: this.getLabels(),
                            position: 'bottom'
                        }
                    ],
                    yAxes: [
                        {
                            type: 'linear',
                            position: 'left',
                            ticks: {
                                min: this.timeToNumeric('04:00'),
                                max: this.timeToNumeric('08:00'),
                                stepSize: 3.6e+6,
                                beginAtZero: false,
                                callback: value => {
                                    return moment(value).format('h A');
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}
</script>

<style scoped>

</style>
