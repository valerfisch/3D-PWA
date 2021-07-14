<template>
  <div class="container">
    <div class="element">
      <button
        type="button"
        v-bind:class="{
          active: width == win.innerWidth && height == win.innerHeight,
        }"
        @click="setFullscreen()"
      >
        Set Canvas Fullscreen
      </button>
      <button
        type="button"
        v-bind:class="{ active: width == 1920 && height == 1080 }"
        @click="setCanvas(1920, 1080)"
      >
        Set Canvas hd
      </button>
      <button
        type="button"
        v-bind:class="{ active: width == 3840 && height == 2160 }"
        @click="setCanvas(3840, 2160)"
      >
        Set Canvas 4k
      </button>
    </div>
    <div class="element">
      <div class="element">
        <div class="label">Width:</div>
        <input
          v-model.lazy="width"
          placeholder="edit me"
          v-on:change="updateViewPort()"
        />
        px
      </div>
      <div class="element">
        <div class="label">Height:</div>
        <input
          v-model.lazy="height"
          placeholder="edit me"
          v-on:change="updateViewPort()"
        />
        px
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CanvasHandler",
  data() {
    return {
      width: this.$store.state.camera.viewPort.width,
      height: this.$store.state.camera.viewPort.height,
      win: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      },
    };
  },
  methods: {
    // sets the canvas resolution to all available space
    setFullscreen() {
      this.width = this.win.innerWidth;
      this.height = this.win.innerHeight;

      this.updateViewPort();
    },
    // set canvas to specific size, either hd or 4k
    setCanvas(x, y) {
      this.width = x;
      this.height = y;

      this.updateViewPort();
    },
    // dispatch updated canvas size to set size
    updateViewPort() {
      this.$store.dispatch("setCanvasSize", { x: this.width, y: this.height });
    },
  },
};
</script>

<style scoped>
.container {
  margin: 3em 0px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}

.element {
  margin: 12px 0px;
}

.label {
  font-size: 1.2em;
}

button {
  color: #266dd3;
  background-color: #fff;
  border: #266dd3 3px solid;
  padding: 9px;
}

.active {
  background-color: #266dd3;
  color: #fff;
}
</style>
