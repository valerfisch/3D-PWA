<template>
  <div style="position: relative">
    <div
      style="
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.5);
        padding: 0.5em;
      "
    >
      <button @click="goBack()">Back</button>
      <ModelSelection />
      <div>Init: {{ initTime }}</div>
      <div>Render: {{ renderTime }}</div>
      <div>ModelLoading: {{ modelTime }}</div>
    </div>
    <div
      id="three-js-container"
      style="position: absolute; top: 0; left: 0; z-index: -1"
    ></div>
  </div>
</template>

<script>
import * as THREE from "three/build/three.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import ModelSelection from "./ModelSelection.vue";

export default {
  name: "Three",
  components: { ModelSelection },
  data() {
    // global values
    return {
      scene: undefined,
      model: undefined,
      camera: undefined,
      controls: undefined,
      unwatch: undefined,
      requestId: undefined,
    };
  },
  computed: {
    // time needed to init
    initTime() {
      if (this.$store.state.times.init.length > 0) {
        return this.$store.state.times.init[
          this.$store.state.times.init.length - 1
        ].time;
      }
      return 0;
    },
    // current frametime
    renderTime() {
      if (this.$store.state.times.render.length > 0) {
        return this.$store.state.times.render[
          this.$store.state.times.render.length - 1
        ].time;
      }
      return 0;
    },
    // model set time
    modelTime() {
      if (this.$store.state.times.model.length > 0) {
        return this.$store.state.times.model[
          this.$store.state.times.model.length - 1
        ].time;
      }
      return 0;
    },
  },
  // cleanup code
  destroyed() {
    if (this.requestId) {
      window.cancelAnimationFrame(this.requestId);
      this.requestId = undefined;
    }
    this.unwatch();
  },
  // on component mounted:
  mounted() {
    // initialize three.js
    this.init();
    // watch for state updates
    this.unwatch = this.$store.watch(
      () => {
        return {
          path: this.$store.state.model.path,
          position: this.$store.state.camera.matrix.position,
        };
      },
      (newValue, oldValue) => {
        // if camera movement updated
        if (newValue.position[0] != oldValue.position[0]) {
          // update camera position
          this.camera.position.set(
            newValue.position[0],
            newValue.position[1],
            newValue.position[2]
          );

          if (this.controls && this.camera) {
            this.camera.updateProjectionMatrix();
            this.controls.update();
          }
        }

        // if model updated
        if (newValue.path != oldValue.path) {
          // remove current model
          var obj = this.scene.children[0];
          this.scene.remove(obj);

          // exchange model analog to setting model in init function
          const startModel = Date.now();
          const loader = new GLTFLoader();

          loader.load(
            newValue.path,
            (gltf) => {
              this.model = gltf;
              this.scene.add(gltf.scene);
              gltf.scene; // THREE.Group
              gltf.scenes; // Array<THREE.Group>
              gltf.asset; // Object
              const endModel = Date.now();
              const durationModel = endModel - startModel;
              this.$store.dispatch("modelLoading", {
                component: "three",
                model: newValue.path,
                time: durationModel,
                begin: startModel,
                end: endModel,
              });
            },
            () => {},
            (err) => {
              console.log("An error happened", err);
            }
          );
        }
      }
    );
  },
  methods: {
    // navigate back to home screen
    goBack() {
      this.$router.push("/");
    },
    // render function
    async render(renderer, camera) {

      // set start render timestamp
      const start = Date.now();

      // render
      renderer.render(this.scene, camera);

      // on next browser repaint
      this.requestId = requestAnimationFrame(() => {
        // once frame got updated:
        // set end render timestamp
        const end = Date.now();
        // calculate duration
        const duration = end - start;
        // store frametime
        this.$store.dispatch("render", {
          component: "three",
          time: duration,
          begin: start,
          end,
        });
        // start next frame render
        this.render(renderer, camera);
      });
    },
    // initialize three.js
    init() {
      // set start init timestamp
      const start = Date.now();

      // create scene
      this.scene = new THREE.Scene();

      // create and set camera properties
      this.camera = new THREE.PerspectiveCamera(
        45.0,
        this.$store.state.camera.viewPort.width /
          this.$store.state.camera.viewPort.height,
        0.1,
        100
      );
      this.camera.position.z = 3;

      // create and set renderer properties
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(
        this.$store.state.camera.viewPort.width,
        this.$store.state.camera.viewPort.height
      );
      renderer.autoClear = true;
      renderer.setClearColor(new THREE.Color(0.3, 0.3, 0.3), 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      renderer.outputEncoding = THREE.sRGBEncoding;

      // create environment generator
      const pmremGenerator = new THREE.PMREMGenerator(renderer);

      // get env path and model path from store
      const envPath = this.$store.state.model.envPath;
      const modelPath = this.$store.state.model.path;

      // load environment
      new RGBELoader()
        .setDataType(THREE.UnsignedByteType)
        .setPath("")
        .load(envPath, (texture) => {
          // set environment map
          const envMap = pmremGenerator.fromEquirectangular(texture).texture;

          // set scene background and environment to calculated values
          this.scene.background = envMap;
          this.scene.environment = envMap;

          // cleanup code
          texture.dispose();
          pmremGenerator.dispose();

          // set start setting model timestamp
          const startModel = Date.now();

          // create model loader and load
          const loader = new GLTFLoader();
          loader.load(
            modelPath,
            (gltf) => {
              // once loaded store model so it can be removed on exchange
              this.model = gltf;
              // add model to scene
              this.scene.add(gltf.scene);
              gltf.scene;
              gltf.scenes;
              gltf.asset;
              // set end setting model timestamp 
              const endModel = Date.now();

              // prerender shader
              pmremGenerator.compileEquirectangularShader();

              // attach renderer dom element to html code
              const tupperware = document.getElementById("three-js-container");
              tupperware.appendChild(renderer.domElement);

              // create controls
              this.controls = new OrbitControls(
                this.camera,
                renderer.domElement
              );
              this.controls.target.set(0, 0, -0.2);
              this.controls.update();


              // set end init timestamp
              const end = Date.now();

              // calculate durations and upload times to store
              const duration = end - start;
              const durationModel = endModel - startModel;
              this.$store.dispatch("modelLoading", {
                component: "three",
                model: modelPath,
                time: durationModel,
                bengin: startModel,
                end: endModel,
              });
              this.$store.dispatch("init", {
                component: "three",
                time: duration,
                begon: start,
                end,
              });

              // start rendering
              return this.render(renderer, this.camera);
            },
            () => {},
            (err) => {
              console.log("An error happened", err);
            }
          );
        });
    },
  },
};
</script>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
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
  color: #42b983;
}
</style>
