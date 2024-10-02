<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  name: "App",
  inject: ['store'],
  data() {
    return {
      t: useI18n().t,
    }
  },
  created() {
    const userLangChoice = this.getLang();
    let lang = "en";
    if (userLangChoice !== null) {
      lang = userLangChoice;
    } else {
      const locale = navigator.language.split("-")[0];
      lang = locale === "fr" ? "fr" : "en";
    }
    this.store.setLang(lang);
    this.$i18n.locale = lang;
    document.title = "MSC AniMet";
  },
  methods: {
    getLang() {
      return localStorage.getItem("user-lang");
    },
  },
};
</script>

<style lang="scss">
html {
  overflow-y: hidden !important;
}
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
/* Handle */
::-webkit-scrollbar-thumb {
  background: #99ddff;
  border-radius: 10px;
}
/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #00aaff;
}
</style>