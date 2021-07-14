<template>
  <div class="column">
    <div
      style="
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgba(255, 255, 255, 0.5);
      "
    >
      <button @click="goBack()">Back</button>
      <ModelSelection />
      <div>Init: {{ initTime }}</div>
      <div>Render: {{ renderTime }}</div>
      <div>ModelLoading: {{ modelTime }}</div>
    </div>
    <canvas
      id="glCanvas"
      :width="canvasWidth"
      :height="canvasHeight"
      style="position: absolute; top: 0; left: 0; z-index: -1"
    ></canvas>
  </div>
</template>

<script>
import * as gltf from "webgl-gltf";
import * as shader from "../utils/shader";
import * as cubemap from "../utils/cubemap";
import { renderModel } from "../utils/renderer";
import { getPinchDistance } from "../utils/input";
import ModelSelection from "./ModelSelection.vue";

export default {
  components: { ModelSelection },
  name: "WebGl",
  data() {
    return {
      lastPostition: undefined,
      zoomStart: undefined,
      model: undefined,
      glContext: undefined,
      unsubscribe: undefined,
      requestId: undefined,
      uniforms: undefined,
    };
  },
  computed: {
    canvasWidth() {
      return this.$store.state.camera.viewPort.width;
    },
    canvasHeight() {
      return this.$store.state.camera.viewPort.height;
    },
    initTime() {
      if (this.$store.state.times.init.length > 0) {
        return this.$store.state.times.init[
          this.$store.state.times.init.length - 1
        ].time;
      }
      return 0;
    },
    renderTime() {
      if (this.$store.state.times.render.length > 0) {
        return this.$store.state.times.render[
          this.$store.state.times.render.length - 1
        ].time;
      }
      return 0;
    },
    modelTime() {
      if (this.$store.state.times.model.length > 0) {
        return this.$store.state.times.model[
          this.$store.state.times.model.length - 1
        ].time;
      }
      return 0;
    },
  },
  destroyed() {
    if (this.requestId) {
      window.cancelAnimationFrame(this.requestId);
      this.requestId = undefined;
    }
    this.unsubscribe();
  },
  mounted() {
    return this.initGL()
      .then(() => {
        this.unsubscribe = this.$store.watch(
          () => {
            return this.$store.state.model.path;
          },
          (newValue) => {
            const startModel = Date.now();

            const uri = newValue;
            // Load model
            gltf.loadModel(this.glContext, uri).then((model) => {
              // Render
              this.model = model;

              const endModel = Date.now();
              const durationModel = endModel - startModel;
              this.$store.dispatch("modelLoading", {
                component: "webGL",
                time: durationModel,
                begin: startModel,
                model: uri,
                end: endModel,
              });
            });
          }
        );
      })
      .catch(() => {
        alert("webGL init unsuccessful");
      });
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
    handleWheel(event) {
      this.$store.dispatch("zoom", event.deltaY > 0 ? 0.05 : -0.05);
    },
    handlePinch(distance) {
      this.$store.dispatch("zoom", this.zoomStart > distance ? 0.025 : -0.025);
      this.zoomStart = distance;
    },
    changeModel() {
      this.$store.dispatch(
        "model",
        this.$store.state.model.path == "/models/platform/platform.gltf"
          ? "/models/DamagedHelmet/DamagedHelmet.gltf"
          : "/models/platform/platform.gltf"
      );
    },
    dragEvent(event) {
      const client = event.touches
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : { x: event.clientX, y: event.clientY };

      if (this.lastPosition !== undefined) {
        this.$store.dispatch("rotate", {
          x: (client.x - this.lastPosition.x) / 100.0,
          y: (client.y - this.lastPosition.y) / 100.0,
        });
      }

      this.lastPosition = {
        x: client.x,
        y: client.y,
      };
    },
    render() {
      const start = Date.now();

      this.glContext.enable(this.glContext.DEPTH_TEST);

      this.glContext.clearColor(0.3, 0.3, 0.3, 1);
      this.glContext.clear(
        this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT
      );

      const cameraMatrix = this.$store.state.camera.matrix;
      this.glContext.uniform3f(
        this.uniforms.cameraPosition,
        cameraMatrix.position[0],
        cameraMatrix.position[1],
        cameraMatrix.position[2]
      );
      this.glContext.uniformMatrix4fv(
        this.uniforms.pMatrix,
        false,
        cameraMatrix.pMatrix
      );
      this.glContext.uniformMatrix4fv(
        this.uniforms.vMatrix,
        false,
        cameraMatrix.vMatrix
      );

      this.glContext.uniform1i(this.uniforms.isAnimated, 0);

      for (let i = 0; i < this.model.nodes.length; i++) {
        renderModel(this.glContext, this.model, i, this.uniforms);
      }

      this.requestId = requestAnimationFrame(() => {
        const end = Date.now();
        const duration = end - start;
        this.$store.dispatch("render", {
          component: "webGL",
          time: duration,
          begin: start,
          end,
        });
        this.render();
      });
    },
    async initGL() {
      const start = Date.now();

      this.$el.addEventListener("wheel", this.handleWheel, { passive: true });

      this.$el.addEventListener("mousedown", () => {
        this.$el.addEventListener("mousemove", this.dragEvent);
      });

      this.$el.addEventListener("mouseup", () => {
        this.$el.removeEventListener("mousemove", this.dragEvent);
        this.lastPosition = undefined;
      });

      this.$el.addEventListener("touchstart", (e) => {
        if (e.touches.length == 2) {
          this.zoomStart = getPinchDistance(e);
        }
      });

      this.$el.addEventListener("touchmove", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.touches.length === 1 && this.zoomStart == undefined) {
          this.dragEvent(e);
          return;
        }

        if (e.touches.length == 2 && this.zoomStart != undefined) {
          this.handlePinch(getPinchDistance(e));
        }
      });

      this.$el.addEventListener("touchend", (e) => {
        if (e.touches.length == 0) {
          this.zoomStart = undefined;
          this.lastPosition = undefined;
        }
      });

      // Init GL
      const canvas = document.querySelector("#glCanvas");
      this.glContext = canvas.getContext("webgl2");

      // init viewport
      this.glContext.viewport(
        0,
        0,
        this.$store.state.camera.viewPort.width,
        this.$store.state.camera.viewPort.height
      );
      this.$store.dispatch("updateCamera", this.$store.state.camera.cam);

      // Shaders
      this.program = shader.createProgram(this.glContext);
      this.glContext.attachShader(
        this.program,
        await shader.loadShader(
          this.glContext,
          "vsDefault",
          this.glContext.VERTEX_SHADER
        )
      );
      this.glContext.attachShader(
        this.program,
        await shader.loadShader(
          this.glContext,
          "fsDefault",
          this.glContext.FRAGMENT_SHADER
        )
      );
      shader.linkProgram(this.glContext, this.program);

      this.uniforms = shader.getUniformLocations(this.glContext, this.program);

      const environment = await cubemap.load(this.glContext);

      cubemap.bind(
        this.glContext,
        environment,
        this.uniforms.brdfLut,
        this.uniforms.environmentDiffuse,
        this.uniforms.environmentSpecular
      );

      const uri = this.$store.state.model.path;

      const startModel = Date.now();
      // Load model
      gltf.loadModel(this.glContext, uri).then((model) => {
        // Render
        this.model = model;

        const endModel = Date.now();
        const end = Date.now();
        const durationModel = endModel - startModel;
        const duration = end - start;
        this.$store.dispatch("init", {
          component: "webGL",
          time: duration,
          begin: start,
          end,
        });
        this.$store.dispatch("modelLoading", {
          component: "webGL",
          model: uri,
          time: durationModel,
          begin: startModel,
          end: endModel,
        });

        this.render();
      });
    },
  },
};
</script>

<!-- "scoped" attribute to limit CSS to this component only -->
<style scoped>
.column {
  position: relative;
}
</style>
