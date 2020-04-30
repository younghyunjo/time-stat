<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container id="EnterWake">
    <v-row align="center">
      <v-col cols="1" sm="4" md="2">
        <h3>일어난 시간</h3>
      </v-col>
      <v-col cols="2" sm="4" md="2">
        <v-menu
          v-model="menu2"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="date"
              label="Date"
              prepend-icon="event"
              readonly
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="menu2 = false"></v-date-picker>
        </v-menu>
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="time"
          label="Time"
          placeholder="05:00"
          @click="clearTimeTextField"
          @keyup.enter="insertWakeTime"
        >
        </v-text-field>
      </v-col>
      <v-btn @click="insertWakeTime" class="pink white--text">Add</v-btn>
    </v-row>
  </v-container>
</template>

<script>
  import EventBus from './EventBus.js'
  import moment from 'moment'

  export default {
    data: () => ({
      time: moment().format('hh:mm'),
      pickedDate: moment().format('YYYY[-]MM[-]DD'),
      menu2: false,
    }),
    methods: {
      clearWakeUpTime() {
        this.time = undefined
      },
      insertWakeTime() {
        EventBus.$emit('EVT-EnterWake', this.pickedDate, this.time)
        this.clearWakeUpTime();
      }
    },
    computed: {},
  }
</script>

<style scoped>
</style>
