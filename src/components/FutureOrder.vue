<template>
  <div class="future-table">
    <v-row class="table-header">
      <v-col>Symbol</v-col>
      <v-col>Type</v-col>
      <v-col>Budget</v-col>
      <v-col>Price</v-col>
      <v-col>Change</v-col>
      <v-col>Profit</v-col>
      <v-col>Elapsed</v-col>
    </v-row>
    <v-row class="table-row" v-for="order of orders" :key="order.orderId">
      <v-col
        ><span :class="`enum ${order.side === 'BUY' ? 'enum--green' : 'enum--red'}`">{{order.side[0]}}</span>
        {{ order.symbol.replace('USDT', '') }}</v-col
      >
      <v-col
        ><span
          v-if="['cut', 'profit'].includes(order.orderType)"
          class="enum enum--green"
          >{{ order.orderType.toUpperCase() }}</span
        >
        <span v-if="order.orderType === 'entry'" class="enum">{{
          order.orderType.toUpperCase()
        }}</span>
        <span
          v-if="['dca', 'childDca'].includes(order.orderType)"
          class="enum enum--red"
          >{{ order.orderType.toUpperCase() }}</span
        >
      </v-col>
      <v-col>{{ round(order.avgPrice * order.origQty, 1) }}</v-col>
      <v-col>{{order.avgPrice}}</v-col>
      <v-col
        ><span v-if="!isNil(order.change)">{{ order.change }}%</span></v-col
      >
      <v-col>{{ order.profit }}</v-col>
      <v-col>{{ msToTime(Date.now() - order.updateTime) }}</v-col>
    </v-row>
  </div>
</template>

<script>
import { round, floor, isNil } from 'lodash';

export default {
  props: {
    orders: { type: Array },
  },

  computed: {
    round() {
      return round;
    },
    isNil() {
      return isNil;
    },
  },

  methods: {
    msToTime(duration) {
      let hours = round(duration / 1000 / 60 / 60);
      let days = 0;

      if (hours > 24) {
        days = floor(hours / 24);
        hours = hours % 24;
      }

      return `${days}d ${hours}h`;
    },
  },
};
</script>

<style lang="scss" scoped>
.future-table {
  background-color: #2d2755;
}
</style>