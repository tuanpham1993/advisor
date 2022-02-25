<template>
  <section class="page-container">
    <v-tabs v-model="tab" background-color="#2d2755" color="white">
      <v-tab> <span class="tab__title"> Exchange </span> </v-tab>

      <v-tab> <span class="tab__title"> Future Bot </span> </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <exchange />
      </v-tab-item>

      <v-tab-item>
        <future />
      </v-tab-item>
    </v-tabs-items>
  </section>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { filter, find, map, sortBy, reduce, round, isNil } from 'lodash';
import Future from '../components/Future.vue';
import Exchange from '../components/Exchange.vue';
import http from '../services/http';

export default {
  name: 'Hold',
  components: {
    Future,
    Exchange,
    // VueJsonPretty,
  },
  data() {
    return {
      symbols: [
        'CAKEBUSD',
        'DOTBUSD',
        'ALICEBUSD',
        'CAKEUSDT',
        'DOTUSDT',
        'ALICEUSDT',
      ],

      displayPortfolios: [],
      portfolios: [],
      exPortfolios: [],
      positions: [],

      bncOriginal: 250,
      otherOriginal: 850,
      futureOriginal: 500,
      balances: {
        USDT: 99999,
        BUSD: 99999,
        USD: 99999,
      },

      onPosVol: 0,
      unSafeVol: 0,
      futureUsdt: 0,
      unSafePoses: [],

      usdtBalance: 0,
      tab: 0,
      profit: 9999,

      config: {},
      configDialog: false,

      increaseCoinStatistic: {},

      futurePositions: [],

      showSummary: false,
      symbolSummary: {},
    };
  },
  computed: {
    total() {
      return Math.round(this.balances.USD);
    },
    bncRemain() {
      return Math.round(this.balances.USDT + this.balances.BUSD);
    },
    budgets() {
      return [
        {
          exchange: 'Blockfolio',
          original: this.otherOriginal,
        },
        {
          exchange: 'Binance',
          original: this.bncOriginal,
          current: this.balances.USD,
          free: this.bncRemain,
          profit: this.profit,
        },
        {
          exchange: 'Binance future',
          original: this.futureOriginal,
          current: this.usdtBalance,
          profit: Math.round(this.usdtBalance - this.futureOriginal),
        },
        {
          exchange: 'Summary',
          original: Math.round(this.bncOriginal + this.futureOriginal),
          current: Math.round(this.balances.USD + this.usdtBalance),
          profit: Math.round(
            this.profit + this.usdtBalance - this.futureOriginal
          ),
        },
      ];
    },

    isNil() {
      return isNil;
    },
    round() {
      return round;
    },
  },
  mounted() {
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.v-input--switch {
  height: 30px;
}

.tab {
  &__title {
    color: white;
  }
}

div {
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
}

.position-block {
  border: solid 1px grey;
  /* border: solid 1px #c9e627; */
  background: #f1f3f4;
  padding: 10px;
  margin-left: 10px;
}

h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.table-header {
  color: white;
  font-weight: 500;
  background-color: #2d2755;
  border-top: solid 1px #2d2755;
  border-left: solid 1px #2d2755;
  border-right: solid 1px #2d2755;
  font-size: 12px;
  padding: 0;
}

.table-row {
  color: white;
  background-color: #2d2755;
  border-top: solid 1px #2d2755;
  border-left: solid 1px #2d2755;
  border-right: solid 1px #2d2755;
  /* font-size: 14px; */
  padding: 0;

  &:last-of-type {
    border-bottom: solid 1px #2d2755;
  }

  &:nth-child(even) {
    background-color: #2d2755;
  }
}

.text-green {
  color: #27ae60;
}

.text-red {
  color: #e74c3c;
}

.text-orange {
  color: #f39c12;
}

.bg-red {
  background-color: #e74c3c;
}

.bg-orange {
  background-color: #f1c40f;
}

.bg-green {
  background-color: #2ecc71;
}

.row {
  margin-left: 0;
  margin-right: 0;
}

.col {
  padding: 2px;
  padding-left: 10px;
}
</style>
