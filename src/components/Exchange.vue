<template>
  <div class="exchange">
    <div class="exchange-summary">
      <div>{{ formatCurrency(totalBudget) }}</div>
      <!-- <div>
        USD: {{ formatCurrency(usd) }} ({{
          round((usd / totalBudget) * 100, 2)
        }}%)
      </div> -->
    </div>

    <v-row>
      <v-col
        cols="12"
        xs="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        v-for="item in farmAssets"
        :key="item.name"
      >
        <farm-card :asset="item"> </farm-card>
      </v-col>
    </v-row>

    <hr />

    <v-row>
      <v-col
        cols="12"
        xs="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        v-for="item in assets"
        :key="item.name"
      >
        <hold-card :asset="item"> </hold-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { round, reduce, find, isNil, filter, map } from 'lodash';
import http from '../services/http';
import formatterMixin from '../mixins/formatter';
import HoldCard from './HoldCard.vue';
import FarmCard from './FarmCard.vue';

export default {
  components: { HoldCard, FarmCard },
  mixins: [formatterMixin],
  data() {
    return {
      assets: [],
      farmAssets: [],
      stableAssets: [],
      config: {},
      unSafeVol: 0,
      unSafePoses: 0,
      totalBudget: 0,
      usd: 0,
    };
  },
  mounted() {
    this.getAssetsSocket();
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
    getAssetsSocket() {
      const getAssetsSocket = new WebSocket(
        `${process.env.VUE_APP_SOCKET_BASE_URL}/assets`
      );
      getAssetsSocket.onerror = (err) => {
        this.getAssetsSocket();
      };
      getAssetsSocket.onclose = (err) => {
        this.getAssetsSocket();
      };

      getAssetsSocket.onmessage = (event) => {
        this.updateAssets(JSON.parse(event.data));
      };
    },
    async updateAssets(assets) {
      const allAssets = map(assets, (asset) => {
        return {
          ...asset,
          avgBuyPriceChange: round(
            (asset.currentPrice / asset.avgBuyPrice - 1) * 100
          ),
        };
      });

      this.assets = filter(
        allAssets,
        ({ name }) => !['BNB', 'CAKE', 'BTC', 'BUSD', 'USDT'].includes(name)
      );

      this.farmAssets = filter(allAssets, ({ name }) =>
        ['BNB', 'CAKE', 'BTC'].includes(name)
      );

      this.stableAssets = filter(allAssets, ({ name }) =>
        ['BUSD', 'USDT'].includes(name)
      );

      this.totalBudget = reduce(
        assets,
        (sum, asset) => sum + asset.totalBudget,
        0
      );

      this.usd =
        find(assets, { name: 'BUSD' }).totalBudget +
        find(assets, { name: 'USDT' }).totalBudget;
    },
  },
};
</script>

<style lang="scss" scoped>
.exchange {
  margin-top: 20px;
  background-color: rgb(28, 23, 60);
}

.exchange-summary {
  margin-bottom: 15px;
  background: #2d2755;
  color: white;
  font-weight: 600;
  padding: 10px;
}

.positions {
  margin-top: 10px;
}

.position {
  width: 200px;
  border: solid 1px grey;
  background: #f1f3f4;
  padding: 10px;
  margin: 10px 10px 0 0;

  &__symbol {
    font-weight: bold;
  }
}
</style>