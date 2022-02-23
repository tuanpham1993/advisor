<template>
  <div class="card">
    <div class="card__header">
      <img :src="item.image_url" />

      <div class="card__block">
        <div>{{ item.name }}</div>
        <div>{{ formatCurrency(item.currentPrice) }}</div>
      </div>

      <div class="card__block">
        <div>Quantity</div>
        <div>{{ item.qty }}</div>
      </div>

      <div class="card__block">
        <div>Amount</div>
        <div>{{ formatCurrency(item.totalBudget) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import formatterMixin from '../mixins/formatter';

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
      console.log(this.item);
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

  &__header {
    display: flex;
    color: white;
    font-size: 30px !important;
    font-weight: 600;
  }

  &__block {
    margin-left: 15px;
    margin-top: 6px;
  }
}
</style>