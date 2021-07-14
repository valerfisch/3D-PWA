<template>
  <div class="hello">
    <CanvasHandler />
    <div class="links">
      <div class="link">
        <router-link to="/webgl">WebGl Implementation ></router-link>
      </div>
      <div class="link">
        <router-link to="/threeJS">three.js  Implementation ></router-link>
      </div>
    </div>
  </div>
</template>

<script>
import CanvasHandler from "./CanvasHandler";

export default {
  name: "HomeScreen",
  components: {
    CanvasHandler
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
  color: #344055;
  font-size: 1.3em;
}

.link {
  margin: 12px;
}

.links {
  margin-top: 4em;
}
</style>
