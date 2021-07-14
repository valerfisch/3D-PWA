function bindBuffer(gl, position, buffer) {
    if (buffer === null) {
        gl.disableVertexAttribArray(position)
        return
    }

    gl.enableVertexAttribArray(position)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)
    gl.vertexAttribPointer(position, buffer.size, buffer.type, false, 0, 0);

    return buffer;
}

function applyTexture(gl, texture, textureTarget, textureUniform, enabledUniform) {
    if (texture) {
        gl.activeTexture(gl.TEXTURE0 + textureTarget);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(textureUniform, textureTarget);
    }

    if (enabledUniform !== undefined) gl.uniform1i(enabledUniform, texture ? 1 : 0);
}

export function renderModel(gl, model, index, uniforms) {
    const node = model.nodes[index];
    if (node.mesh == undefined) {
        return;
    }
    
    const mesh = model.meshes[node.mesh];
    const material = model.materials[mesh.material];

    if (material) {
        applyTexture(gl, material.baseColorTexture, 0, uniforms.baseColorTexture, uniforms.hasBaseColorTexture);
        applyTexture(gl, material.metallicRoughnessTexture, 1, uniforms.metallicRoughnessTexture, uniforms.hasMetallicRoughnessTexture);
        applyTexture(gl, material.emissiveTexture, 2, uniforms.emissiveTexture, uniforms.hasEmissiveTexture);
        applyTexture(gl, material.normalTexture, 3, uniforms.normalTexture, uniforms.hasNormalTexture);
        applyTexture(gl, material.occlusionTexture, 4, uniforms.occlusionTexture, uniforms.hasOcclusionTexture);

        gl.uniform4f(uniforms.baseColorFactor, material.baseColorFactor[0], material.baseColorFactor[1], material.baseColorFactor[2], material.baseColorFactor[3]);
        gl.uniform1f(uniforms.metallicFactor, material.metallicFactor);
        gl.uniform1f(uniforms.roughnessFactor, material.roughnessFactor);
        gl.uniform3f(uniforms.emissiveFactor, material.emissiveFactor[0], material.emissiveFactor[1], material.emissiveFactor[2]);
    }

    bindBuffer(gl, uniforms.position, mesh.positions);
    bindBuffer(gl, uniforms.normal, mesh.normals);
    bindBuffer(gl, uniforms.tangent, mesh.tangents);
    bindBuffer(gl, uniforms.texCoord, mesh.texCoord);
    bindBuffer(gl, uniforms.joints, mesh.joints);
    bindBuffer(gl, uniforms.weights, mesh.weights);

    gl.uniformMatrix4fv(uniforms.mMatrix, false, node.localBindTransform);

    if (mesh.indices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
        gl.drawElements(gl.TRIANGLES, mesh.elementCount, gl.UNSIGNED_SHORT, 0);
    } else {
        gl.drawArrays(gl.TRIANGLES, 0, mesh.elementCount);
    }

    for (const c of node.children) {
        renderModel(gl, model, c, uniforms)
    }
}