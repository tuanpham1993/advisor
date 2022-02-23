<template>
  <div class="card">
    <div class="card__summary">
      <img :src="item.image_url" />

      <div class="card__block">
        <div>{{ item.name }}</div>
        <div>{{ formatCurrency(item.currentPrice.toFixed(9)) }}</div>
      </div>

      <div class="card__block">
        <div>Quantity</div>
        <div>{{ item.qty }}</div>
      </div>

      <div class="card__block">
        <div>Amount</div>
        <div :class="item.totalBudget < item.budget ? 'text-red' : ''">
          {{ formatCurrency(item.totalBudget) }}/{{
            formatCurrency(item.budget)
          }}
        </div>
      </div>
    </div>

    <hr />

    <div class="card__detail">
      <div class="card__block" v-if="item.setpointPrice">
        <div>Last Action</div>
        <div
          :class="
            (item.currentPrice / item.setpointPrice - 1) * 100 <= -50
              ? 'text-red'
              : ''
          "
        >
          {{ round((item.currentPrice / item.setpointPrice - 1) * 100) }}%
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import formatterMixin from '../mixins/formatter';
import { round, isFinite } from 'lodash';

export default {
  mixins: [formatterMixin],
  props: { asset: {} },
  data() {
    return {
      item: this.asset,
    };
  },
  watch: {
    asset() {
      this.item = this.asset;
      if (this.item.name === 'KUMA') {
          console.log(this.item)
      }
    },
  },
  computed: {
    round() {
      return round;
    },
    isFinite() {
      return isFinite;
    },
  },
};
</script>

<style lang="scss" scoped>
.card {
  background-color: rgb(45, 39, 85);
  border-radius: 0.75rem;
  border-width: 1px;
  padding: 12px 15px;

  &__summary {
    display: flex;
    color: white;
    font-size: 30px !important;
    font-weight: 600;
  }

  &__block {
    margin-left: 15px;
    margin-top: 6px;
  }

  &__detail {
    display: flex;
    color: white;
    font-size: 30px !important;
    font-weight: 600;
  }
}
</style>