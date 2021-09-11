!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).Dotz={})}(this,(function(e){"use strict";const t=e=>e;let r=t`
  precision mediump float;
  attribute float a_index;
  uniform sampler2D u_particles;
  uniform float u_particles_res;
  varying vec2 v_particle_pos;
  void main() {
    vec4 color = texture2D(u_particles, vec2(
      fract(a_index / u_particles_res),
      floor(a_index / u_particles_res) / u_particles_res)
    );

    v_particle_pos = vec2(
      color.r / 255.0 + color.b,
      color.g / 255.0 + color.a
    );

    gl_PointSize = 1.0;
    gl_Position = vec4(2.0 * v_particle_pos.x - 1.0, 1.0 - 2.0 * v_particle_pos.y, 0, 1);
  }
`,i=t`
  precision mediump float;
  uniform sampler2D u_wind;
  uniform vec2 u_wind_min;
  uniform vec2 u_wind_max;
  uniform sampler2D u_color_ramp;
  varying vec2 v_particle_pos;
  void main() {
    vec2 velocity = mix(u_wind_min, u_wind_max, texture2D(u_wind, v_particle_pos).rg);
    float speed_t = length(velocity) / length(u_wind_max);
    
    vec2 ramp_pos = vec2(
      fract(4.0 * speed_t),
      floor(4.0 * speed_t) / 4.0
    );
    gl_FragColor = texture2D(u_color_ramp, ramp_pos);
  }
`,a=t`
  precision mediump float;
  attribute vec2 a_pos;
  varying vec2 v_tex_pos;
  void main() {
    v_tex_pos = a_pos;
    gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
  }
`,o=t`
  precision mediump float;
  uniform sampler2D u_screen;
  uniform float u_opacity;
  varying vec2 v_tex_pos;
  void main() {
    vec4 color = texture2D(u_screen, 1.0 - v_tex_pos);
    
    gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);
  }
`,n=t`
  precision highp float;
  uniform sampler2D u_particles;
  uniform sampler2D u_wind;
  uniform vec2 u_wind_res;
  uniform vec2 u_wind_min;
  uniform vec2 u_wind_max;
  uniform float u_rand_seed;
  uniform float u_speed_factor;
  uniform float u_drop_rate;
  uniform float u_drop_rate_bump;
  varying vec2 v_tex_pos;
  const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);

  float rand(const vec2 co) {
    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));
  }
  vec2 lookup_wind(const vec2 uv) {
    return texture2D(u_wind, uv).rg;
  }
  void main() {
    vec4 color = texture2D(u_particles, v_tex_pos);
    vec2 pos = vec2(
    color.r / 255.0 + color.b,
    color.g / 255.0 + color.a);

    vec2 velocity = mix(u_wind_min, u_wind_max, lookup_wind(pos));
    float speed_t = length(velocity) / length(u_wind_max);

    float distortion = cos(radians(pos.y * 180.0 - 90.0));
    vec2 offset = vec2(velocity.x / distortion, -velocity.y) * 0.0001 * u_speed_factor;

    pos = fract(1.0 + pos + offset);

    vec2 seed = (pos + v_tex_pos) * u_rand_seed;

    float drop_rate = u_drop_rate + speed_t * u_drop_rate_bump;
    float drop = step(1.0 - drop_rate, rand(seed));

    vec2 random_pos = vec2(
    rand(seed + 1.3),
    rand(seed + 2.1));
    pos = mix(pos, random_pos, drop);

    gl_FragColor = vec4(
    fract(pos * 255.0),
    floor(pos * 255.0) / 255.0);
  }
`;function s(e,t,r){var i=e.createShader(t);if(e.shaderSource(i,r),e.compileShader(i),!e.getShaderParameter(i,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(i));return i}function c(e,t,r){var i=e.createProgram(),a=s(e,e.VERTEX_SHADER,t),o=s(e,e.FRAGMENT_SHADER,r);if(e.attachShader(i,a),e.attachShader(i,o),e.linkProgram(i),!e.getProgramParameter(i,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(i));for(var n={program:i},c=e.getProgramParameter(i,e.ACTIVE_ATTRIBUTES),u=0;u<c;u++){var _=e.getActiveAttrib(i,u);n[_.name]=e.getAttribLocation(i,_.name)}for(var d=e.getProgramParameter(i,e.ACTIVE_UNIFORMS),l=0;l<d;l++){var h=e.getActiveUniform(i,l);n[h.name]=e.getUniformLocation(i,h.name)}return n}function u(e,t,r,i,a){var o=e.createTexture();return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),r instanceof Uint8Array?e.texImage2D(e.TEXTURE_2D,0,e.RGBA,i,a,0,e.RGBA,e.UNSIGNED_BYTE,r):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.bindTexture(e.TEXTURE_2D,null),o}function _(e,t,r){e.activeTexture(e.TEXTURE0+r),e.bindTexture(e.TEXTURE_2D,t)}function d(e,t){var r=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),r}function l(e,t,r,i){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,i,e.FLOAT,!1,0,0)}function h(e,t,r){e.bindFramebuffer(e.FRAMEBUFFER,t),r&&e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0)}const f=new Map;let m={fade:.96,colors:{"0.0":"#000","1.0":"#fff"},speed:.5,dropRate:.01,dropRateBump:.01,particles:1e5,windData:{width:360,height:180,uMin:-20,uMax:20,vMin:-20,vMax:20}};e.Dotz=class{constructor(e,t,s){"createImageBitmap"in window||(window.createImageBitmap=e=>new Promise(((t,r)=>{let i;if(e instanceof Blob)i=URL.createObjectURL(e);else if(e instanceof Image){const t=document.createElement("canvas"),r=t.getContext("2d");t.width=e.width,t.height=e.height,r.drawImage(e,0,0),i=t.toDataURL()}else r("createImageBitmap can't use the given image type");const a=new Image;a.crossOrigin="Anonymous",a.onload=function(){t(this),e instanceof Blob&&URL.revokeObjectURL(e)},a.src=i}))),e.width=s.width||e.clientWidth;let u=e.width;e.height=s.height||e.clientHeight;let _=e.getContext("webgl",{antialiasing:!1});this.gl=_,Object.assign(this,m,s),this.drawProgram=c(_,r,i),this.screenProgram=c(_,a,o),this.updateProgram=c(_,a,n),this.quadBuffer=d(_,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1])),this.framebuffer=_.createFramebuffer(),this.ready=!1,this.setTerrain=this.setTerrain.bind(this),this.frame=this.frame.bind(this),this.setTerrain(t),this.resize(),this.frame(),s.width&&s.height||window.addEventListener("resize",(()=>{let{clientHeight:t,clientWidth:r}=e;t!==u&&(e.width=u=s.width||r,e.height=s.height||t,this.resize())}))}frame(){this.draw(),requestAnimationFrame(this.frame)}get particles(){return this._particles}set particles(e){var t=this.gl,r=this.particleStateResolution=Math.ceil(Math.sqrt(e));this._particles=r*r;for(var i=new Uint8Array(4*this._particles),a=0;a<i.length;a++)i[a]=Math.floor(256*Math.random());this.particleStateTexture0=u(t,t.NEAREST,i,r,r),this.particleStateTexture1=u(t,t.NEAREST,i,r,r);for(var o=new Float32Array(this._particles),n=0;n<this._particles;n++)o[n]=n;this.particleIndexBuffer=d(t,o)}resize(){var e=this.gl,t=new Uint8Array(e.canvas.width*e.canvas.height*4);this.backgroundTexture=u(e,e.NEAREST,t,e.canvas.width,e.canvas.height),this.screenTexture=u(e,e.NEAREST,t,e.canvas.width,e.canvas.height)}set colors(e){this._colors=e;let t=document.createElement("canvas");t.width=16,t.height=1;var r=t.getContext("2d"),i=r.createLinearGradient(0,0,16,0);for(var a in e)i.addColorStop(+a,e[a]);r.fillStyle=i,r.fillRect(0,0,16,1);let o=new Uint8Array(r.getImageData(0,0,16,1).data);this.colorRampTexture=u(this.gl,this.gl.LINEAR,o,4,4),t.width=0,t.height=0,t.remove()}get colors(){return this._colors}setTerrain(e){if(f.has(e))this.ready=!0,this.windTexture=u(this.gl,this.gl.LINEAR,f.get(e));else{const t=new Image,r=this.setTerrain;let i=function(){createImageBitmap(this).then((t=>{f.set(e,t),r(e)}))};t.onload=i,t.crossOrigin="Anonymous",t.src=e,t.complete&&i.call(t)}}draw(){if(this.ready){var e=this.gl;e.disable(e.DEPTH_TEST),e.disable(e.STENCIL_TEST),_(e,this.windTexture,0),_(e,this.particleStateTexture0,1),this.drawScreen(),this.updateParticles()}}drawScreen(){var e=this.gl;h(e,this.framebuffer,this.screenTexture),e.viewport(0,0,e.canvas.width,e.canvas.height),this.drawTexture(this.backgroundTexture,this.fade),this.drawParticles(),h(e,null),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),this.drawTexture(this.screenTexture,1),e.disable(e.BLEND);var t=this.backgroundTexture;this.backgroundTexture=this.screenTexture,this.screenTexture=t}drawTexture(e,t){var r=this.gl,i=this.screenProgram;r.useProgram(i.program),l(r,this.quadBuffer,i.a_pos,2),_(r,e,2),r.uniform1i(i.u_screen,2),r.uniform1f(i.u_opacity,t),r.drawArrays(r.TRIANGLES,0,6)}drawParticles(){var e=this.gl,t=this.drawProgram;e.useProgram(t.program),l(e,this.particleIndexBuffer,t.a_index,1),_(e,this.colorRampTexture,2),e.uniform1i(t.u_wind,0),e.uniform1i(t.u_particles,1),e.uniform1i(t.u_color_ramp,2),e.uniform1f(t.u_particles_res,this.particleStateResolution),e.uniform2f(t.u_wind_min,this.windData.uMin,this.windData.vMin),e.uniform2f(t.u_wind_max,this.windData.uMax,this.windData.vMax),e.drawArrays(e.POINTS,0,this._particles)}updateParticles(){var e=this.gl;h(e,this.framebuffer,this.particleStateTexture1),e.viewport(0,0,this.particleStateResolution,this.particleStateResolution);var t=this.updateProgram;e.useProgram(t.program),l(e,this.quadBuffer,t.a_pos,2),e.uniform1i(t.u_wind,0),e.uniform1i(t.u_particles,1),e.uniform1f(t.u_rand_seed,Math.random()),e.uniform2f(t.u_wind_res,this.windData.width,this.windData.height),e.uniform2f(t.u_wind_min,this.windData.uMin,this.windData.vMin),e.uniform2f(t.u_wind_max,this.windData.uMax,this.windData.vMax),e.uniform1f(t.u_speed_factor,this.speed),e.uniform1f(t.u_drop_rate,this.dropRate),e.uniform1f(t.u_drop_rate_bump,this.dropRateBump),e.drawArrays(e.TRIANGLES,0,6);var r=this.particleStateTexture0;this.particleStateTexture0=this.particleStateTexture1,this.particleStateTexture1=r}},Object.defineProperty(e,"__esModule",{value:!0})}));
