<template>
  <v-app class="app">
    <v-app-bar color="rgb(28, 23, 60)" app>
      <v-toolbar-title>
        <v-btn color="orange" icon>
          <v-icon large>mdi-bitcoin</v-icon>
        </v-btn>

        <span class="app__name">Cryptocurrency</span>
      </v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>

    <v-main class="app-container">
      <crypto />
    </v-main>
  </v-app>
</template>

<script>
import Crypto from './views/Crypto';

export default {
  name: 'App',

  components: {
    Crypto,
    // Orders,
    // Positions,
    // Signals,
    // Cron,
  },
  data: () => ({
    tab: 0,
    focused: false,
    authorizied: false,
    selectedSizes: [],
    sizeOptions: [{ id: '1', name: 'XS' }],
  }),
  methods: {
    nameChange(name) {
      if (name === 'Legend investor') {
        this.authorizied = true;
      }
    },
  },
  mounted() {
    window.onfocus = () => {
      this.focused = true;
    };
    window.onblur = () => {
      this.focused = false;
    };
  },
};
</script>

<style lang="scss">
.app {
  &__name {
    color: white;
    font-weight: 600;
  }
}

.app-container {
  background-color: rgb(28, 23, 60);
  margin-top: 10px;
}

.page-container {
  padding: 0 16px;
}

.page-header {
  color: white;
  padding: 10px 0;
  font-size: 30px;
  font-weight: 500;
  text-transform: uppercase;
}
</style>