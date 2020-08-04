import {HorizontalBar, mixins} from 'vue-chartjs'

const {reactiveProp} = mixins

export default {
  extends: HorizontalBar,
  mixins: [reactiveProp],
  props: ['options'],
  mounted() {
    // this.chartData isZ created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  },
  watch: {
    options: function (newOption) {
      this.options = newOption;
      this.renderChart(this.chartData, this.options);
    },
    chartData: function (newChartData) {
      this.chartData = newChartData;
      this.renderChart(this.chartData, this.options);
    }
  }
}
