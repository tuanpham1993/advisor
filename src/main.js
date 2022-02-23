import Vue from 'vue';
import App from './App.vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import './assets/app.scss'
import router from './router';
import vuetify from './plugins/vuetify';
import VJsoneditor from 'v-jsoneditor/src/index';

Vue.use(VJsoneditor);

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: h => h(App),
}).$mount('#app');

Vue.prototype.$vue = Vue;
