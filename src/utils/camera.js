import { vec3 } from 'gl-matrix';


export const getPosition = (camera) => vec3.fromValues(
    camera.distance * Math.sin(-camera.rY) * Math.cos(-camera.rX),
    camera.distance * Math.sin(camera.rX),
    camera.distance * Math.cos(-camera.rY) * Math.cos(-camera.rX),
)
