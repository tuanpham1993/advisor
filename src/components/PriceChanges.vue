<template>
  <div class="future-table">
    <v-row class="table-header">
      <v-col>Symbol</v-col>
      <v-col>Change</v-col>
      <v-col>Action</v-col>
    </v-row>
    <v-row class="table-row" v-for="item of priceChanges" :key="item.symbol">
      <v-col>{{ item.symbol }}</v-col>
      <v-col :class="+item.priceChangePercent > 0 ? 'text-green' : 'text-red'"
        >{{ item.priceChangePercent }}%</v-col
      >
      <v-col
        ><a style="color: white; font-weight: 600" @click="long(item.symbol)"
          >LONG</a
        >
        |
        <a style="color: white; font-weight: 600" @click="short(item.symbol)"
          >SHORT</a
        >
        |
        <a
          style="color: white; font-weight: 600"
          target="_blank"
          :href="`https://www.binance.com/en/futures/${item.symbol}`"
          >BNC</a
        >
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { round, floor, isNil } from 'lodash';
import http from '../services/http';

export default {
  props: {
    priceChanges: { type: Array },
  },
  methods: {
    long(symbol) {
      http.post(`future/long?symbol=${symbol}`);
    },
    short(symbol) {
      http.post(`future/short?symbol=${symbol}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.future-table {
  background-color: #2d2755;
}
</style>