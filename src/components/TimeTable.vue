<template>
  <div style="margin: 0px auto; width: 100%; max-width: 1050px">
    <div>
      <button @click="goBack()">Back</button>
    </div>
    <div class="chart-container">
      <div id="init-chart" class="responsive-chart"></div>
      <div id="loadtime-chart" class="responsive-chart"></div>
      <div id="winit-chart" class="responsive-chart"></div>
      <div id="tinit-chart" class="responsive-chart"></div>
      <div id="fps-chart" style="width: 80%; min-width: 320px"></div>
    </div>
  </div>
</template>

<script>
import ApexCharts from "apexcharts";

export default {
  name: "TimeTable",
  computed: {
    wInit() {
      return this.$store.state.times.init.filter((t) => t.component == "webGL");
    },
    tInit() {
      return this.$store.state.times.init.filter((t) => t.component == "three");
    },
    wRender() {
      return this.$store.state.times.render.filter(
        (t) => t.component == "webGL"
      );
    },
    tRender() {
      return this.$store.state.times.render.filter(
        (t) => t.component == "three"
      );
    },
    wModel() {
      return this.$store.state.times.model.filter(
        (t) => t.component == "webGL"
      );
    },
    tModel() {
      return this.$store.state.times.model.filter(
        (t) => t.component == "three"
      );
    },
  },
  data() {
    return {
      tMinRender: 1000000,
      tAvgRender: 0,
      tMaxRender: 0,
      wMinRender: 1000000,
      wAvgRender: 0,
      wMaxRender: 0,
    };
  },
  mounted() {
    // get phase length from state (10000ms)
    const phaseLength = this.$store.state.test.phaseLength;
    // set interval length 1000ms
    const interval = 1000;

    // init frame time arrays
    const wFrameTime = [];
    const tFrameTime = [];

    // get start dates from
    const wStart = this.$store.state.times.wBeginTest;
    const tStart = this.$store.state.times.tBeginTest;

    // if testing has not yet run abort
    if (!wStart || !tStart) {
      return;
    }

    // set init chart options
    var init = {
      chart: {
        type: "line",
      },
      series: [
        {
          name: "webGL",
          data: this.wInit.map((t) => t.time),
          type: "column",
        },
        {
          name: "three.js",
          data: this.tInit.map((t) => t.time),
          type: "column",
        },
      ],
    };

    // create init chart and render it
    var initChart = new ApexCharts(document.querySelector("#init-chart"), init);
    initChart.render();

    // set model exchange time options
    var model = {
      chart: {
        type: "line",
      },
      series: [
        {
          name: "webGL",
          data: this.wModel.map((t) => t.time),
          type: "column",
        },
        {
          name: "three.js",
          data: this.tModel.map((t) => t.time),
          type: "column",
        },
      ],
      xaxis: {
        categories: [
          this.wModel[0].model
            .split("/")
            .reduce((s, curr) =>
              s.includes(".gltf") ? (curr = s) : (curr += "")
            ),
          this.wModel[1].model
            .split("/")
            .reduce((s, curr) =>
              s.includes(".gltf") ? (curr = s) : (curr += "")
            ),
          this.wModel[2].model
            .split("/")
            .reduce((s, curr) =>
              s.includes(".gltf") ? (curr = s) : (curr += "")
            ),
        ],
      },
    };

    // create model chart and render it
    var modelChart = new ApexCharts(
      document.querySelector("#loadtime-chart"),
      model
    );
    modelChart.render();

    // WebGL init time and first model loading time
    var wInit = {
      chart: {
        type: "donut",
      },
      series: [this.wModel[0].time, this.wInit[0].time - this.wModel[0].time],
      labels: ["first model loading", "init without first model loading"],
    };
    var wInitChart = new ApexCharts(
      document.querySelector("#winit-chart"),
      wInit
    );
    wInitChart.render();

    // Three.js init time and first model loading time
    var tInit = {
      chart: {
        type: "donut",
      },
      series: [this.tModel[0].time, this.tInit[0].time - this.tModel[0].time],
      labels: ["first model loading", "init without first model loading"],
    };
    var tInitChart = new ApexCharts(
      document.querySelector("#tinit-chart"),
      tInit
    );
    tInitChart.render();

    // bucket length
    const length = (3 * phaseLength) / interval;

    // for each bucket add new array to FrameTimeArrays
    for (let i = 0; i < length; i++) {
      wFrameTime.push([]);
      tFrameTime.push([]);
    }

    // For all collected frame times:
    // push frametime in bucket
    for (let i = 0; i < this.wRender.length; i++) {
      const bucket = Math.floor((this.wRender[i].begin - wStart) / interval);
      wFrameTime[bucket].push(this.wRender[i].time);
    }

    for (let i = 0; i < this.tRender.length; i++) {
      const bucket = Math.floor((this.tRender[i].begin - tStart) / interval);
      tFrameTime[bucket].push(this.tRender[i].time);
    }

    // calculate average frametime in this second
    const wAvgFrame = wFrameTime
      .map((bucket) => bucket.reduce((acc, curr) => curr + acc, 0))
      .map((acc, i) => {
        if (wFrameTime[i].length > 0) {
          return 1000 / (acc / wFrameTime[i].length);
        }
        return 0;
      });
    const tAvgFrame = tFrameTime
      .map((bucket) => bucket.reduce((acc, curr) => curr + acc, 0))
      .map((acc, i) => {
        if (tFrameTime[i].length > 0) {
          return 1000 / (acc / tFrameTime[i].length);
        }
        return 0;
      });

    // set fps graph options
    let fps = {
      chart: {
        type: "line",
      },
      series: [
        {
          name: "webGL",
          data: wAvgFrame,
        },
        {
          name: "threeJS",
          data: tAvgFrame,
        },
      ],
      xaxis: {
        categories: length,
        labels: {
          formatter: function (value) {
            return (value * interval) / 1000 + "s";
          },
        },
      },
      yaxis: {
        labels: {
          formatter: function (value) {
            return Math.floor(value) + " frames";
          },
        },
      },
    };

    // create and render fps chart
    var fpsChart = new ApexCharts(document.querySelector("#fps-chart"), fps);
    fpsChart.render();
    fpsChart.addXaxisAnnotation({
      x: 0,
      borderColor: "#00E396",
      label: {
        orientation: "horizontal",
        text: "platform",
        borderColor: "#00E396",
      },
    });

    fpsChart.addXaxisAnnotation({
      x: phaseLength / 1000 + "s",
      x2: (2 * phaseLength) / 1000 + "s",
      fillColor: "#B3F7CA",
      borderColor: "#00E396",
      label: {
        orientation: "horizontal",
        text: "helmet",
        borderColor: "#00E396",
      },
    });

    fpsChart.addXaxisAnnotation({
      x: (2 * phaseLength) / 1000 + "s",
      borderColor: "#00E396",
      label: {
        orientation: "horizontal",
        text: "multiple helmet",
        borderColor: "#00E396",
      },
    });
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.chart-container {
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
}

.responsive-chart {
  min-width: 320px;
  width: 48%;
}
</style>
