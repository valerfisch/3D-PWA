<template>
  <div id="app">
    <Testing></Testing>
    <router-view></router-view>
  </div>
</template>

<script>
import Testing from "./components/Testing";

export default {
  name: "App",
  components: {
    Testing,
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

button {
  margin: 12px;
  padding: 12px;
  background-color: #344055;
  color: #fff;
  border-radius: 16px;
  border: none;
  width: 20%;
  min-width: 120px;
  max-width: 380px;
  font-weight: 700;
}
</style>