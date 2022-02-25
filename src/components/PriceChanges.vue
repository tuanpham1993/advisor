<template>
  <div class="future-table">
    <v-row class="table-header">
      <v-col>Symbol</v-col>
      <v-col>Change</v-col>
    </v-row>
    <v-row class="table-row" v-for="item of priceChanges" :key="item.symbol">
      <v-col>{{ item.symbol }}</v-col>
      <v-col>{{ item.priceChangePercent }}%</v-col>
    </v-row>
  </div>
</template>

<script>
import { round, floor, isNil } from 'lodash';

export default {
  props: {
    priceChanges: { type: Array },
  },
};
</script>

<style lang="scss" scoped>
.future-table {
  background-color: #2d2755;
}
</style>