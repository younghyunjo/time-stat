import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import API_URL from "@/common/config";

const ApiService = {
  init() {
    Vue.use(VueAxios, axios);
    Vue.axios.defaults.baseURL = API_URL;
    this.test()
  },
  query(resource, params) {
    return Vue.axios.get(resource, {
      params: params
    }).catch(error => {
      throw new Error(`ApiService ${error}`);
    })
  },
  test() {
    // SleepTimeService.get("2020-07-20")
    // SleepTimeService.getLast7Days("2020-07-20")
  }
}
export default ApiService;

export const SleepTimeService = {
  get(date) {
    ApiService.query('/sleep', {
      date: date
    });
  },
  getLast7Days(date) {
    return ApiService.query('/sleeptime', {
      date: date,
      last: 8,
    });
  }
}
