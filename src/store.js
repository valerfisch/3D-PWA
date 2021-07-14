import Vue from 'vue'
import Vuex from 'vuex'

import { mat4, vec3 } from 'gl-matrix';

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        camera: {
            cam: {
                rY: 0.0,
                rX: 0.0,
                distance: 3.0,
            },
            matrix: {
                pMatrix: mat4.create(),
                vMatrix: mat4.create(),
                position: vec3.create()
            },
            viewPort: {
                width: 1280,
                height: 960
            },
        },
        model: {
            path: "/models/platform/platform.gltf",
            envPath: "/environment/large_corridor_2k.hdr"
        },
        times: {
            wBeginTest: undefined,
            tBeginTest: undefined,
            render: [],
            init: [],
            model: []
        },
        test: {
            phaseLength: 10000
        }
    },
    actions: {
        model({ commit }, path) {
            commit('updateModel', { path })
        },

        resetTimes({ commit }) {
            commit('resetTimes')
        },

        wBeginTest({ commit }, time) {
            commit('wBeginTest', time)
        },
        tBeginTest({ commit }, time) {
            commit('tBeginTest', time)
        },

        init({ commit }, time) {
            commit('addInitTime', time)
        },

        render({ commit }, time) {
            commit('addRenderTime', time)
        },

        modelLoading({ commit }, time) {
            commit('addModelTime', time)
        },

        zoom({ dispatch, state }, delta) {
            let distance = state.camera.cam.distance * (1.0 + delta);
            if (distance < 0.0) distance = 0.0;

            dispatch('updateCamera', { distance })
        },

        rotate({ dispatch, state }, delta) {
            let rX = state.camera.cam.rX + delta.y;
            let rY = state.camera.cam.rY + delta.x;
            dispatch('updateCamera', { rX, rY })
        },

        updateCamera({ commit, state }, cam) {
            const c = {
                rX: (cam.rX || state.camera.cam.rX),
                rY: (cam.rY || state.camera.cam.rY),
                distance: (cam.distance || state.camera.cam.distance),
            }
            const pMatrix = mat4.create();
            const vMatrix = mat4.create();
            const position = vec3.create();

            position[0] = c.distance * Math.sin(-c.rY) * Math.cos(-c.rX);
            position[1] = c.distance * Math.sin(c.rX);
            position[2] = c.distance * Math.cos(-c.rY) * Math.cos(-c.rX);

            mat4.translate(vMatrix, vMatrix, vec3.fromValues(0.0, 0.0, -c.distance));
            mat4.rotateX(vMatrix, vMatrix, c.rX);
            mat4.rotateY(vMatrix, vMatrix, c.rY);

            mat4.perspective(pMatrix, 45.0, state.camera.viewPort.width / state.camera.viewPort.height, 0.1, 100.0);

            const matrix = { pMatrix, vMatrix, position }

            commit('updateCamera', { cam: c, matrix })
        },
        setCanvasSize({commit}, {x, y}) {
            commit('setCanvasSize', {x, y})
        }
    },
    mutations: {
        updateCamera(state, camera) {
            state.camera = { ...state.camera, ...camera }
        },
        updateModel(state, path) {
            state.model = { ...state.model, ...path }
        },
        resetTimes(state) {
            state.times.wBeginTest= undefined
            state.times.tBeginTest= undefined
            state.times.init = []
            state.times.render = []
            state.times.model = []
        },
        wBeginTest(state, time) {
            state.times.wBeginTest = time
        },
        tBeginTest(state, time) {
            state.times.tBeginTest = time
        },
        addInitTime(state, time) {
            state.times.init.push({ ...time })
        },
        addRenderTime(state, time) {
            state.times.render.push({ ...time })
        },
        addModelTime(state, time) {
            state.times.model.push({ ...time })
        },
        setCanvasSize(state, {x, y}) {
            state.camera.viewPort.width = x;
            state.camera.viewPort.height = y;
        }
    }
})