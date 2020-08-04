import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import 'material-design-icons-iconfont/dist/material-design-icons.css'

import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ApiService from "./common/api.service"

Vue.config.productionTip = false
Chart.plugins.unregister(ChartDataLabels);
ApiService.init();

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
