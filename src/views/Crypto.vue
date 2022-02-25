<template>
  <section class="page-container">
    <v-tabs v-model="tab" background-color="#2d2755" color="white">
      <v-tab> <span class="tab__title"> Exchange </span> </v-tab>

      <v-tab> <span class="tab__title"> Future Bot </span> </v-tab>

      <v-tab> <span class="tab__title"> Increase </span> </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <exchange />
      </v-tab-item>

      <v-tab-item>
        <future />
      </v-tab-item>

      <v-tab-item>
        <v-row style="padding-right: 20px">
          <v-col
            cols="12"
            xs="12"
            sm="6"
            md="4"
            lg="3"
            xl="2"
            v-for="item in increaseCoinStatistic"
            :key="item.id"
          >
            <div class="position-block">
              <div class="mb-2">
                <v-btn>
                  <v-icon @click="openDialog(item.id, item.symbol, 'BUY')"
                    >mdi-plus</v-icon
                  >
                </v-btn>
                <v-btn>
                  <v-icon @click="openDialog(item.id, item.symbol, 'SELL')"
                    >mdi-minus</v-icon
                  >
                </v-btn>
                <v-btn>
                  <v-icon
                    @click="
                      openUpdateDialog(
                        item.id,
                        item.symbol,
                        item.buyBudget,
                        item.sellBudget,
                        item.buyEnabled,
                        item.sellEnabled
                      )
                    "
                    >mdi-pencil</v-icon
                  >
                </v-btn>
              </div>
              <div>
                <b>{{ item.name }} {{ item.currentPrice }}</b>
              </div>
              <div>
                Cut Price:
                {{
                  item.cutPrices.length > 0
                    ? `${item.cutPrices[0]} (${item.cutPrices.length})`
                    : 'None'
                }}
              </div>
              <div>
                DCA Price:
                {{
                  item.dcaPrices.length > 0
                    ? `${item.dcaPrices[0]} (${item.dcaPrices.length})`
                    : 'None'
                }}
              </div>
              <div>
                Next Sell:
                {{
                  round(
                    item.sellSetpoint * (1 + item.priceStep),
                    item.pricePrecision
                  )
                }}
              </div>
              <div>
                Next Buy:
                {{
                  round(
                    item.buySetpoint * (1 - item.priceStep),
                    item.pricePrecision
                  )
                }}
              </div>

              <div>
                <a @click="getSummary(item.symbol)">Summary</a>
              </div>

              <div class="mt-2" v-if="item.grab.length > 0">
                <div>Grab</div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="showSummary" width="500">
      <v-card>
        <v-card-title>Summary</v-card-title>
        <v-row class="table-row">
          <v-col class="col-6"> Buy avg price </v-col>
          <v-col class="col-6">
            {{ currencyFormat(symbolSummary.buyAvgPrice) }}
          </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Sell avg price </v-col>
          <v-col class="col-6">
            {{ currencyFormat(symbolSummary.sellAvgPrice) }}
          </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Buy budget </v-col>
          <v-col class="col-6">
            {{ currencyFormat(symbolSummary.buyBudget) }}
          </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Sell budget </v-col>
          <v-col class="col-6">
            {{ currencyFormat(symbolSummary.sellBudget) }}
          </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Buy qty </v-col>
          <v-col class="col-6"> {{ symbolSummary.buyQty }} </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Sell qty </v-col>
          <v-col class="col-6"> {{ symbolSummary.sellQty }} </v-col>
        </v-row>
        <v-row class="table-row">
          <v-col class="col-6"> Profit </v-col>
          <v-col class="col-6">
            {{ currencyFormat(symbolSummary.profit) }}</v-col
          >
        </v-row>
      </v-card>
    </v-dialog>

    <v-dialog v-model="increaseDialog" width="500">
      <v-card>
        <v-col cols="10">
          <v-select
            v-model="increaseDialogSymbol"
            :items="symbols"
            label="Symbol"
          ></v-select>
        </v-col>

        <v-col cols="10">
          <v-select
            v-model="increaseDialogSide"
            :items="['BUY', 'SELL']"
            label="Side"
          ></v-select>
        </v-col>

        <v-col cols="10">
          <v-text-field
            v-model.number="increaseDialogBudget"
            type="number"
            label="Budget"
          ></v-text-field>
        </v-col>

        <v-col cols="10">
          <v-checkbox v-model="increaseDialogGrab" label="Grab"></v-checkbox>
        </v-col>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="addOrder()"> Add </v-btn>

          <v-btn color="primary" text @click="increaseDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="increaseUpdatePositionDialog" width="500">
      <v-card>
        <v-col cols="10">
          <v-select
            v-model="increaseUpdatePositionDialogSymbol"
            :items="symbols"
            label="Symbol"
          ></v-select>
        </v-col>

        <v-col cols="10">
          <v-text-field
            v-model.number="increaseUpdatePositionDialogBuyBudget"
            type="number"
            label="Buy Budget"
          ></v-text-field>
        </v-col>

        <v-col cols="10">
          <v-text-field
            v-model.number="increaseUpdatePositionDialogSellBudget"
            type="number"
            label="Sell Budget"
          ></v-text-field>
        </v-col>

        <v-col cols="10">
          <v-checkbox
            v-model="increaseUpdatePositionDialogBuyEnabled"
            label="Buy Enabled"
          ></v-checkbox>
        </v-col>

        <v-col cols="10">
          <v-checkbox
            v-model="increaseUpdatePositionDialogSellEnabled"
            label="Sell Enabled"
          ></v-checkbox>
        </v-col>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="updatePosition()"> Update </v-btn>

          <v-btn
            color="primary"
            text
            @click="increaseUpdatePositionDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="configDialog" width="500">
      <v-card>
        <v-jsoneditor v-model="config" :plus="false" height="400px" />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="saveConfig()"> Update </v-btn>

          <v-btn color="primary" text @click="configDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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

      posId: null,

      increaseDialog: false,
      increaseDialogSymbol: 'CAKEBUSD',
      increaseDialogSide: 'BUY',
      increaseDialogBudget: 100,
      increaseDialogGrab: false,

      increaseUpdatePositionDialog: false,
      increaseUpdatePositionDialogSymbol: 'CAKEBUSD',
      increaseUpdatePositionDialogBuyBudget: 20,
      increaseUpdatePositionDialogSellBudget: 20,
      increaseUpdatePositionDialogBuyEnabled: true,
      increaseUpdatePositionDialogSellEnabled: true,

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
    this.update();
    this.interval = setInterval(this.update, 10000);
  },
  destroyed() {
    clearInterval(this.interval);
  },
  methods: {
    async getSummary(pair) {
      const { data: summary } = await http.get('summary', { params: { pair } });
      this.symbolSummary = summary;
      this.showSummary = true;
    },

    currencyFormat(num) {
      return '$' + `${num}`.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    },

    openDialog(id, symbol, side) {
      this.posId = id;
      this.increaseDialog = true;
      this.increaseDialogSymbol = symbol;
      this.increaseDialogSide = side;
    },

    openUpdateDialog(
      id,
      symbol,
      buyBudget,
      sellBudget,
      buyEnabled,
      sellEnabled
    ) {
      this.posId = id;
      this.increaseUpdatePositionDialog = true;
      this.increaseUpdatePositionDialogSymbol = symbol;
      this.increaseUpdatePositionDialogBuyBudget = buyBudget;
      this.increaseUpdatePositionDialogSellBudget = sellBudget;
      this.increaseUpdatePositionDialogBuyEnabled = buyEnabled;
      this.increaseUpdatePositionDialogSellEnabled = sellEnabled;
    },

    async updatePosition() {
      await http.post('increase-coin/update-position', {
        id: this.posId,
        symbol: this.increaseUpdatePositionDialogSymbol,
        buyBudget: +this.increaseUpdatePositionDialogBuyBudget,
        sellBudget: +this.increaseUpdatePositionDialogSellBudget,
        buyEnabled: this.increaseUpdatePositionDialogBuyEnabled,
        sellEnabled: this.increaseUpdatePositionDialogSellEnabled,
      });

      this.increaseUpdatePositionDialog = false;
    },

    async addOrder() {
      await http.post('increase-coin/add-order', {
        id: this.posId,
        symbol: this.increaseDialogSymbol,
        budget: this.increaseDialogBudget,
        side: this.increaseDialogSide,
        isGrab: this.increaseDialogGrab,
      });

      this.increaseDialog = false;
    },

    async viewConfig() {
      this.configDialog = true;

      const { data: config } = await http.get('future/config');
      this.config = config;
    },

    async saveConfig() {
      await http.post('future/config', this.config);
      this.configDialog = false;
    },

    async update() {
      const { data: statistic } = await http.get('increase-coin/trade-static');
      this.increaseCoinStatistic = {
        ...statistic,
      };
    },
    close(symbol) {
      http.post(`future/close?symbol=${symbol}`);
    },
  },
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
