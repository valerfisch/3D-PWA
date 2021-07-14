<template>
  <div class="element models">
    <button
      type="button"
      v-bind:class="{
        active: model == '/models/platform/platform.gltf',
      }"
      @click="setModel('/models/platform/platform.gltf')"
    >
      Platform
    </button>
    <button
      type="button"
      v-bind:class="{
        active: model == '/models/DamagedHelmet/DamagedHelmet.gltf',
      }"
      @click="setModel('/models/DamagedHelmet/DamagedHelmet.gltf')"
    >
      Damaged Helmet
    </button>
    <button
      type="button"
      v-bind:class="{
        active: model == '/models/DamagedHelmet/DamagedHelmetsDuplicated.gltf',
      }"
      @click="setModel('/models/DamagedHelmet/DamagedHelmetsDuplicated.gltf')"
    >
      Multiple Damaged Helmet
    </button>
  </div>
</template>

<script>
export default {
  name: "ModelSelection",
  computed: {
    model() {
      return this.$store.state.model.path;
    },
  },
  methods: {
    // exchange model path in store
    setModel(modelUrl) {
      this.$store.dispatch("model", modelUrl);
    },
  },
};
</script>

<style scoped>
.active {
  background-color: #344055;
  color: #fff;
}

button {
  color: #344055;
  background-color: transparent;
  border: #344055 3px solid;
  padding: 9px;
}
</style>