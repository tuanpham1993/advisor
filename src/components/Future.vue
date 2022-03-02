<template>
  <div style="background-color: rgb(28, 23, 60)">
    <div class="future-info">
      <v-row>
        <v-col>
          <b>Config</b>
          <div>Position Budget: {{ formatCurrency(config.baseBudget) }}</div>
          <div>Long Qty: {{ config.longNumPos }}</div>
          <div>Short Qty: {{ config.shortNumPos }}</div>
        </v-col>
        <v-col>
          <b>Reality</b>
          <div>USD: {{ formatCurrency(config.usd) }}</div>
          <div>
            Long Qty:
            {{
              filter(positions, (position) => position.side === 'LONG').length
            }}
          </div>
          <div>
            Short Qty:
            {{
              filter(positions, (position) => position.side === 'SHORT').length
            }}
          </div>
          <div>Risky Long Vol: {{ formatCurrency(unSafeLongVol) }}</div>
          <div>Risky Short Vol: {{ formatCurrency(unSafeShortVol) }}</div>
        </v-col>
        <v-col>
          <b>24h</b>
          <div>
            24h Open: {{ lastDayOpen }} ({{
              formatCurrency(lastDayOpenBudget)
            }})
          </div>
          <div>
            24h Close: {{ lastDayClose }} ({{
              formatCurrency(lastDayCloseBudget)
            }})
          </div>
          <div>24h Profit Orders: {{ lastDayProfitOrdersCount }}</div>
          <div>24h Profit: {{ formatCurrency(lastDayProfit) }}</div>
        </v-col>
      </v-row>
    </div>

    <v-tabs v-model="tab" background-color="#2d2755" color="white">
      <v-tab><span class="tab__title"> Positions </span> </v-tab>

      <v-tab> <span class="tab__title">Orders</span> </v-tab>

      <v-tab> <span class="tab__title">Changes</span> </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab" class="tab__content">
      <v-tab-item>
        <v-row class="table-header">
          <v-col>Symbol</v-col>
          <v-col>Price</v-col>
          <v-col>Budget</v-col>
          <v-col>Profit</v-col>
          <v-col>Target</v-col>

          <v-col>Elapsed</v-col>
        </v-row>
        <v-row
          class="table-row"
          v-for="position of autoPositions"
          :key="position.symbol"
        >
          <v-col
            ><span v-if="position.side === 'LONG'" class="side buy-side">L</span
            ><span class="side sell-side" v-else>S</span>
            &nbsp;
            <a @click="viewDetail(position)">{{
              position.symbol.replace('USDT', '')
            }}</a></v-col
          >
          <v-col>{{ position.currentPrice }} / {{ position.avgPrice }}</v-col>
          <v-col
            :class="
              Math.abs(+position.position.positionAmt * position.currentPrice) >
              50
                ? 'text-red'
                : ''
            "
            >{{
              round(+position.position.positionAmt * position.currentPrice, 2)
            }}</v-col
          >
          <v-col
            :class="
              position.status === 0
                ? 'text-orange'
                : position.status === 2
                ? 'text-green'
                : 'text-red'
            "
            >{{ round(position.position.unRealizedProfit, 1) }}</v-col
          >
          <v-col
            ><div v-if="position.status !== 2">
              <span class="text-red">{{ position.toLow }}</span> |
              <span class="text-green">{{ position.toHigh }}</span>
            </div></v-col
          >
          <v-col
            :class="
              new Date() - position.createdAt > 30 * 24 * 60 * 60 * 1000
                ? 'text-red'
                : ''
            "
            >{{ position.elapsedTime }}</v-col
          >
        </v-row>

        <hr />

        <v-row class="table-header">
          <v-col>Symbol</v-col>
          <v-col>Price</v-col>
          <v-col>Budget</v-col>
          <v-col>Profit</v-col>
          <v-col>Last Action</v-col>
        </v-row>

        <v-row
          class="table-row"
          v-for="position of manualPositions"
          :key="position.symbol"
        >
          <v-col
            ><span v-if="position.side === 'LONG'" class="side buy-side">L</span
            ><span class="side sell-side" v-else>S</span>
            &nbsp;
            <a @click="viewDetail(position)">{{
              position.symbol.replace('USDT', '')
            }}</a></v-col
          >
          <v-col>{{ position.currentPrice }} / {{ position.avgPrice }}</v-col>
          <v-col>{{
            round(+position.position.positionAmt * position.currentPrice, 2)
          }}</v-col>
          <v-col
            :class="
              position.status === 0
                ? 'text-orange'
                : position.status === 2
                ? 'text-green'
                : 'text-red'
            "
            >{{ round(position.position.unRealizedProfit, 1) }}</v-col
          >

          <v-col>
            <span v-if="position.lastOrder">
              {{ position.lastOrder.side }} at
              {{ position.lastOrder.avgPrice }}</span
            >
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <future-order :orders="orders" />
      </v-tab-item>

      <v-tab-item>
        <price-changes :priceChanges="priceChanges" />
      </v-tab-item>
    </v-tabs-items>

    <v-dialog v-model="showDetail" width="500">
      <v-card>
        <v-card-title>
          <span v-if="selectedPosition.side === 'LONG'" class="side buy-side"
            >B</span
          ><span class="side sell-side" v-else>S</span>
          &nbsp;
          {{
            selectedPosition.symbol &&
            selectedPosition.symbol.replace('USDT', '')
          }}</v-card-title
        >

        <div class="ml-6 mr-6 pb-6">
          <v-row>
            <v-col
              ><div>Avg {{ selectedPosition.avgPrice }}</div></v-col
            >
            <v-col
              ><div>Current {{ selectedPosition.currentPrice }}</div></v-col
            >
          </v-row>
          <v-row>
            <v-col
              ><div>
                Budget
                {{
                  selectedPosition.position
                    ? round(
                        +selectedPosition.position.positionAmt *
                          selectedPosition.currentPrice,
                        2
                      )
                    : 0
                }}
              </div></v-col
            >
            <v-col
              ><div>
                Profit
                {{
                  selectedPosition.position
                    ? round(selectedPosition.position.unRealizedProfit, 1)
                    : 0
                }}
              </div></v-col
            >
          </v-row>
          <v-row>
            <v-col
              ><div>
                Next profit {{ selectedPosition.profitStopPrice }}
              </div></v-col
            >
            <v-col
              ><div>Next cut {{ selectedPosition.cutStopPrice }}</div></v-col
            >
          </v-row>
          <v-row>
            <v-col>
              <div>Next dca {{ selectedPosition.dcaStopPrice }}</div></v-col
            >
            <v-col>
              <div>
                Next child dca {{ selectedPosition.childDcaStopPrice }}
              </div></v-col
            >
          </v-row>
          <hr />

          <future-order :orders="selectedPosition.activities" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import {
  round,
  reduce,
  map,
  isEmpty,
  filter,
  sortBy,
  reverse,
  orderBy,
} from 'lodash';
import http from '../services/http';
import FutureOrder from './FutureOrder.vue';
import formatterMixin from '../mixins/formatter';
import PriceChanges from './PriceChanges.vue';

export default {
  components: { FutureOrder, PriceChanges },
  mixins: [formatterMixin],
  data() {
    return {
      positions: [],
      autoPositions: [],
      manualPositions: [],
      config: {},
      priceChanges: [],
      unSafeVol: 0,
      unSafePoses: 0,
      unSafeLongPoses: 0,
      unSafeLongVol: 0,
      unSafeShortPoses: 0,
      unSafeShortVol: 0,
      showDetail: false,
      selectedPosition: {},
      tab: 0,
      orders: [],

      lastDayOpen: 0,
      lastDayClose: 0,
      lastDayOpenBudget: 0,
      lastDayCloseBudget: 0,
      lastDayProfitOrdersCount: 0,
      lastDayProfit: 0,
    };
  },
  mounted() {
    this.connectGetPositionsSocket();
    this.connectGetOrdersSocket();
    this.connectGetConfigSocket();
    this.connectGetPriceChangeSocket();
  },
  computed: {
    round() {
      return round;
    },
    filter() {
      return filter;
    },
  },
  methods: {
    connectGetPositionsSocket() {
      const getPositionsSocket = new WebSocket(
        `${process.env.VUE_APP_SOCKET_BASE_URL}/future-positions`
      );
      getPositionsSocket.onerror = (err) => {
        this.connectGetPositionsSocket();
      };
      getPositionsSocket.onclose = (err) => {
        this.connectGetPositionsSocket();
      };
      getPositionsSocket.onmessage = (event) => {
        this.updatePositions(JSON.parse(event.data));
      };
    },

    connectGetOrdersSocket() {
      const getOrdersSocket = new WebSocket(
        `${process.env.VUE_APP_SOCKET_BASE_URL}/future-orders`
      );
      getOrdersSocket.onerror = (err) => {
        this.connectGetOrdersSocket();
      };
      getOrdersSocket.onclose = (err) => {
        this.connectGetOrdersSocket();
      };

      getOrdersSocket.onmessage = (event) => {
        this.updateOrders(JSON.parse(event.data));
      };
    },

    connectGetConfigSocket() {
      const getConfigSocket = new WebSocket(
        `${process.env.VUE_APP_SOCKET_BASE_URL}/future-config`
      );
      getConfigSocket.onerror = (err) => {
        this.connectGetConfigSocket();
      };
      getConfigSocket.onclose = (err) => {
        this.connectGetConfigSocket();
      };

      getConfigSocket.onmessage = (event) => {
        this.updateConfig(JSON.parse(event.data));
      };
    },

    connectGetPriceChangeSocket() {
      const getPriceChangeSocket = new WebSocket(
        `${process.env.VUE_APP_SOCKET_BASE_URL}/price-changes`
      );
      getPriceChangeSocket.onerror = (err) => {
        this.connectGetPriceChangeSocket();
      };
      getPriceChangeSocket.onclose = (err) => {
        this.connectGetPriceChangeSocket();
      };

      getPriceChangeSocket.onmessage = (event) => {
        this.updatePriceChange(JSON.parse(event.data));
      };
    },

    async updatePositions(positions) {
      positions.sort(function (a, b) {
        return a.position.unRealizedProfit - b.position.unRealizedProfit;

        if (a.status !== b.status) {
          if (a.status === 1) {
            return -1;
          }

          if (a.status === 0) {
            if (b.status === 1) {
              return 1;
            }

            return -1;
          }

          if (a.status === 2) {
            return 1;
          }
        }

        return +a.position.markPrice * Math.abs(+a.position.positionAmt) >
          +b.position.markPrice * Math.abs(+b.position.positionAmt)
          ? -1
          : 1;
      });

      this.onPosVol = round(
        reduce(
          positions,
          (accum, position) =>
            accum +
            (position.position
              ? +position.position.markPrice *
                Math.abs(+position.position.positionAmt)
              : 0),
          0
        ),
        2
      );

      const unSafePoses = filter(
        positions,
        (position) => position.status !== 2
      );
      this.unSafePoses = unSafePoses.length;
      this.unSafeVol = round(
        reduce(
          unSafePoses,
          (accum, position) =>
            accum +
            (position.position
              ? +position.position.markPrice *
                Math.abs(+position.position.positionAmt)
              : 0),
          0
        ),
        2
      );

      const unSafeLongPoses = filter(
        positions,
        (position) => position.status !== 2 && position.side === 'LONG'
      );
      this.unSafeLongPoses = unSafeLongPoses.length;
      this.unSafeLongVol = round(
        reduce(
          unSafeLongPoses,
          (accum, position) =>
            accum +
            (position.position
              ? +position.position.markPrice *
                Math.abs(+position.position.positionAmt)
              : 0),
          0
        ),
        2
      );

      const unSafeShortPoses = filter(
        positions,
        (position) => position.status !== 2 && position.side === 'SHORT'
      );
      this.unSafeShortPoses = unSafeShortPoses.length;
      this.unSafeShortVol = round(
        reduce(
          unSafeShortPoses,
          (accum, position) =>
            accum +
            (position.position
              ? +position.position.markPrice *
                Math.abs(+position.position.positionAmt)
              : 0),
          0
        ),
        2
      );

      this.positions = positions;
      this.autoPositions = filter(positions, ({ manual }) => !manual);
      this.manualPositions = filter(positions, ({ manual }) => manual);
      const orders = [];
      for (const position of positions) {
        orders.push(...this.concatOrders(position));
      }

      // this.orders = reverse(sortBy(orders, 'updateTime'));
    },

    async updateOrders(orders) {
      this.orders = orderBy(
        map(orders, (order) => ({
          orderType: order.type,
          change: order.change,
          profit: order.profit && round(order.profit, 2),
          ...order.order,
        })),
        'updateTime',
        'desc'
      );

      const lastDayOrders = filter(
        this.orders,
        (order) => Date.now() - order.updateTime < 24 * 60 * 60 * 1000
      );

      const lastDayOpen = filter(lastDayOrders, ({ orderType }) =>
        ['entry', 'dca', 'childDca'].includes(orderType)
      );
      const lastDayClose = filter(lastDayOrders, ({ orderType }) =>
        ['cut', 'profit'].includes(orderType)
      );
      this.lastDayOpen = lastDayOpen.length;
      this.lastDayClose = lastDayClose.length;
      this.lastDayOpenBudget = round(
        reduce(
          lastDayOpen,
          (sum, { origQty, avgPrice }) => sum + origQty * avgPrice,
          0
        )
      );
      this.lastDayCloseBudget = round(
        reduce(
          lastDayClose,
          (sum, { origQty, avgPrice }) => sum + origQty * avgPrice,
          0
        )
      );

      const lastDayProfitOrders = filter(lastDayClose, {
        orderType: 'profit',
      });
      this.lastDayProfitOrdersCount = lastDayProfitOrders.length;
      this.lastDayProfit = round(
        reduce(lastDayProfitOrders, (sum, { profit }) => sum + profit, 0),
        1
      );
    },

    async updateConfig(config) {
      this.config = config;
    },

    async updatePriceChange(priceChanges) {
      this.priceChanges = priceChanges;
    },

    viewDetail(position) {
      this.showDetail = true;
      this.selectedPosition = position;

      const filledOrders = this.concatOrders(position);

      position.activities = filledOrders;
    },

    concatOrders(position) {
      let filledOrders = map(position.filledDcaOrders, (order) => ({
        ...order,
        orderType: 'dca',
      }))
        .concat(
          map(position.filledCutOrders, (order) => ({
            ...order,
            orderType: 'cut',
          }))
        )
        .concat(
          map(position.filledChildDcaOrders, (order) => ({
            ...order,
            orderType: 'childDca',
          }))
        );

      filledOrders = orderBy(filledOrders, 'updateTime');

      filledOrders = map(filledOrders, (order, index) => {
        if (index === 0) {
          return {
            ...order,
            change: round((order.avgPrice / position.entryPrice - 1) * 100, 1),
          };
        }

        return {
          ...order,
          change: round(
            (order.avgPrice / filledOrders[index - 1].avgPrice - 1) * 100,
            1
          ),
        };
      });

      return reverse(filledOrders);
    },
  },
};
</script>

<style lang="scss" scoped>
.future-info {
  color: white;
  background: #2d2755;
  padding: 10px;
  margin: 10px 0;
}

.positions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.position {
  width: 200px;
  background: #2d2755;
  color: white;
  padding: 10px;
  margin: 10px 10px 0 0;

  &__symbol {
    font-weight: bold;
  }
}

.side {
  border: solid 1px;
  padding: 1px;
  color: white;
}

.buy-side {
  background-color: #2ecc71;
}

.sell-side {
  background-color: #e74c3c;
}

.tab {
  &__content {
    margin-top: 10px;
    color: white;
    background-color: #2d2755 !important;
  }
}
</style>