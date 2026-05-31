import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./style.css";
import vue3GoogleLogin from "vue3-google-login";
import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.use(vue3GoogleLogin, {
  clientId:
    "227981969296-c110ukh349qasgrlvb1t4eq6bu14n15g.apps.googleusercontent.com", // Wajib diisi dari Google Cloud Console
});

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "top-right",
  theme: "colored",
});

app.mount("#app");
