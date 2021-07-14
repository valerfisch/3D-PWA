<template>
  <div class="container">
    <div v-if="!testing">
      <button @click="test()">Test</button>
      <button @click="testFixed(1920, 1080)">Test HD Canvas</button>
      <button @click="testFixed(3840, 2160)">Test 4K Canvas</button>
    </div>
    <div v-if="testing" class="overlay">
      <div class="warning">
        ! Overlay active during testing - Input is disabled !
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Testing",
  mounted() {},

  data() {
    return {
      testing: false,
    };
  },
  methods: {
    // before testing set canvas size
    async testFixed(width, height) {
      this.$store.dispatch("setCanvasSize", { x: width, y: height });
      return this.test();
    },
    async test() {
      const phaseLength = this.$store.state.test.phaseLength; // 10 seconds default value; can get exchanged in ../store.js

      // enable overlay and temporarily disable test buttons
      this.testing = true;

      // start simulated movement
      let interval = await this.simulateMovement();

      // reset all time entries in state store
      this.$store.dispatch("resetTimes");

      // set WebGL begin test timestamp
      this.$store.dispatch("wBeginTest", Date.now());
      // set model to platform model
      this.$store.dispatch("model", "/models/platform/platform.gltf");
      // router open WebGL implementation
      this.$router.push("webgl");

      // after 1 phase exchange model to damaged helmet
      setTimeout(() => {
        this.$store.dispatch(
          "model",
          "/models/DamagedHelmet/DamagedHelmet.gltf"
        );
      }, 1 * phaseLength);

      // after 2 phases exchange model to multiple damaged helmets
      setTimeout(() => {
        this.$store.dispatch(
          "model",
          "/models/DamagedHelmet/DamagedHelmetsDuplicated.gltf"
        );
      }, 2 * phaseLength);

      // after 3 phases:
      // - route to home
      // - exchange model back to platform
      setTimeout(() => {
        this.$router.push("/");
        this.$store.dispatch("model", "/models/platform/platform.gltf");
      }, 3 * phaseLength);

      // after 4 phases:
      // - set three.js begin timestamp
      // - route to three.js implementation
      setTimeout(() => {
        this.$store.dispatch("tBeginTest", Date.now());
        this.$router.push("threeJS");
      }, 4 * phaseLength);

      // after 5 phases exchange model to damaged helmet
      setTimeout(() => {
        this.$store.dispatch(
          "model",
          "/models/DamagedHelmet/DamagedHelmet.gltf"
        );
      }, 5 * phaseLength);

      // after 6 phases exchange model to multiple damaged helmets
      setTimeout(() => {
        this.$store.dispatch(
          "model",
          "/models/DamagedHelmet/DamagedHelmetsDuplicated.gltf"
        );
      }, 6 * phaseLength);

      // after 7 phases:
      // - route to results page
      // - clear auto rotation
      // - disable overlay and reenable test buttons
      setTimeout(() => {
        this.$router.push("timetable");
        clearInterval(interval);
        this.testing = false;
      }, 7 * phaseLength);
    },
    // simulate movement
    async simulateMovement() {
      // every 33ms dispatch a rotate event
      return setInterval(() => {
        this.$store.dispatch("rotate", { x: 0.05, y: 0 });
      }, 33);
    },
  },
};
</script>

<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100vh;
  pointer-events: all;
  z-index: 10;
}

.warning {
  margin: 12px auto;
  padding: 12px;
  border-radius: 12px;
  background-color: #f1a208;
  font-weight: 800;
  font-size: 1.2em;
  z-index: 20;
  width: fit-content;
}
</style>
