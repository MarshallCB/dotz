const e=e=>e;let t=e`
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
`,r=e`
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
`,a=e`
  precision mediump float;
  attribute vec2 a_pos;
  varying vec2 v_tex_pos;
  void main() {
    v_tex_pos = a_pos;
    gl_Position = vec4(1.0 - 2.0 * a_pos, 0, 1);
  }
`,i=e`
  precision mediump float;
  uniform sampler2D u_screen;
  uniform float u_opacity;
  varying vec2 v_tex_pos;
  void main() {
    vec4 color = texture2D(u_screen, 1.0 - v_tex_pos);
    
    gl_FragColor = vec4(floor(255.0 * color * u_opacity) / 255.0);
  }
`,o=e`
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
`;function n(e,t,r){var a=e.createShader(t);if(e.shaderSource(a,r),e.compileShader(a),!e.getShaderParameter(a,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(a));return a}function s(e,t,r){var a=e.createProgram(),i=n(e,e.VERTEX_SHADER,t),o=n(e,e.FRAGMENT_SHADER,r);if(e.attachShader(a,i),e.attachShader(a,o),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(a));for(var s={program:a},c=e.getProgramParameter(a,e.ACTIVE_ATTRIBUTES),u=0;u<c;u++){var _=e.getActiveAttrib(a,u);s[_.name]=e.getAttribLocation(a,_.name)}for(var l=e.getProgramParameter(a,e.ACTIVE_UNIFORMS),d=0;d<l;d++){var f=e.getActiveUniform(a,d);s[f.name]=e.getUniformLocation(a,f.name)}return s}function c(e,t,r,a,i){var o=e.createTexture();return e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t),r instanceof Uint8Array?e.texImage2D(e.TEXTURE_2D,0,e.RGBA,a,i,0,e.RGBA,e.UNSIGNED_BYTE,r):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,r),e.bindTexture(e.TEXTURE_2D,null),o}function u(e,t,r){e.activeTexture(e.TEXTURE0+r),e.bindTexture(e.TEXTURE_2D,t)}function _(e,t){var r=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),r}function l(e,t,r,a){e.bindBuffer(e.ARRAY_BUFFER,t),e.enableVertexAttribArray(r),e.vertexAttribPointer(r,a,e.FLOAT,!1,0,0)}function d(e,t,r){e.bindFramebuffer(e.FRAMEBUFFER,t),r&&e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0)}const f=new Map;function h(e,t,r){"createImageBitmap"in window||(window.createImageBitmap=e=>new Promise(((t,r)=>{let a;if(e instanceof Blob)a=URL.createObjectURL(e);else if(e instanceof Image){const t=document.createElement("canvas"),r=t.getContext("2d");t.width=e.width,t.height=e.height,r.drawImage(e,0,0),a=t.toDataURL()}else r("createImageBitmap can't use the given image type");const i=new Image;i.onload=function(){t(this),e instanceof Blob&&URL.revokeObjectURL(e)},i.src=a}))),e.width=e.clientWidth,e.height=e.clientHeight;let a=e.getContext("webgl",{antialiasing:!1}),i=new p(a,t,r);return function e(){i.draw(),requestAnimationFrame(e)}(),i}let m={fade:.96,colors:{"0.0":"#000","1.0":"#fff"},speed:.5,dropRate:.01,dropRateBump:.01,particles:1e5,windData:{width:360,height:180,uMin:-20,uMax:20,vMin:-20,vMax:20}};class p{constructor(e,n,c){this.gl=e,Object.assign(this,m,c),this.drawProgram=s(e,t,r),this.screenProgram=s(e,a,i),this.updateProgram=s(e,a,o),this.quadBuffer=_(e,new Float32Array([0,0,1,0,0,1,0,1,1,0,1,1])),this.framebuffer=e.createFramebuffer(),this.ready=!1,this.setTerrain=this.setTerrain.bind(this),this.setTerrain(n),this.resize()}get particles(){return this._particles}set particles(e){var t=this.gl,r=this.particleStateResolution=Math.ceil(Math.sqrt(e));this._particles=r*r;for(var a=new Uint8Array(4*this._particles),i=0;i<a.length;i++)a[i]=Math.floor(256*Math.random());this.particleStateTexture0=c(t,t.NEAREST,a,r,r),this.particleStateTexture1=c(t,t.NEAREST,a,r,r);for(var o=new Float32Array(this._particles),n=0;n<this._particles;n++)o[n]=n;this.particleIndexBuffer=_(t,o)}resize(){var e=this.gl,t=new Uint8Array(e.canvas.width*e.canvas.height*4);this.backgroundTexture=c(e,e.NEAREST,t,e.canvas.width,e.canvas.height),this.screenTexture=c(e,e.NEAREST,t,e.canvas.width,e.canvas.height)}set colors(e){this._colors=e;let t=document.createElement("canvas");t.width=16,t.height=1;var r=t.getContext("2d"),a=r.createLinearGradient(0,0,16,0);for(var i in e)a.addColorStop(+i,e[i]);r.fillStyle=a,r.fillRect(0,0,16,1);let o=new Uint8Array(r.getImageData(0,0,16,1).data);this.colorRampTexture=c(this.gl,this.gl.LINEAR,o,4,4),t.width=0,t.height=0,t.remove()}get colors(){return this._colors}setTerrain(e){if(f.has(e))this.ready=!0,this.windTexture=c(this.gl,this.gl.LINEAR,f.get(e));else{const t=new Image,r=this.setTerrain;let a=function(){createImageBitmap(this).then((t=>{f.set(e,t),r(e)}))};t.onload=a,t.src=e,t.complete&&a.call(t)}}draw(){if(this.ready){var e=this.gl;e.disable(e.DEPTH_TEST),e.disable(e.STENCIL_TEST),u(e,this.windTexture,0),u(e,this.particleStateTexture0,1),this.drawScreen(),this.updateParticles()}}drawScreen(){var e=this.gl;d(e,this.framebuffer,this.screenTexture),e.viewport(0,0,e.canvas.width,e.canvas.height),this.drawTexture(this.backgroundTexture,this.fade),this.drawParticles(),d(e,null),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),this.drawTexture(this.screenTexture,1),e.disable(e.BLEND);var t=this.backgroundTexture;this.backgroundTexture=this.screenTexture,this.screenTexture=t}drawTexture(e,t){var r=this.gl,a=this.screenProgram;r.useProgram(a.program),l(r,this.quadBuffer,a.a_pos,2),u(r,e,2),r.uniform1i(a.u_screen,2),r.uniform1f(a.u_opacity,t),r.drawArrays(r.TRIANGLES,0,6)}drawParticles(){var e=this.gl,t=this.drawProgram;e.useProgram(t.program),l(e,this.particleIndexBuffer,t.a_index,1),u(e,this.colorRampTexture,2),e.uniform1i(t.u_wind,0),e.uniform1i(t.u_particles,1),e.uniform1i(t.u_color_ramp,2),e.uniform1f(t.u_particles_res,this.particleStateResolution),e.uniform2f(t.u_wind_min,this.windData.uMin,this.windData.vMin),e.uniform2f(t.u_wind_max,this.windData.uMax,this.windData.vMax),e.drawArrays(e.POINTS,0,this._particles)}updateParticles(){var e=this.gl;d(e,this.framebuffer,this.particleStateTexture1),e.viewport(0,0,this.particleStateResolution,this.particleStateResolution);var t=this.updateProgram;e.useProgram(t.program),l(e,this.quadBuffer,t.a_pos,2),e.uniform1i(t.u_wind,0),e.uniform1i(t.u_particles,1),e.uniform1f(t.u_rand_seed,Math.random()),e.uniform2f(t.u_wind_res,this.windData.width,this.windData.height),e.uniform2f(t.u_wind_min,this.windData.uMin,this.windData.vMin),e.uniform2f(t.u_wind_max,this.windData.uMax,this.windData.vMax),e.uniform1f(t.u_speed_factor,this.speed),e.uniform1f(t.u_drop_rate,this.dropRate),e.uniform1f(t.u_drop_rate_bump,this.dropRateBump),e.drawArrays(e.TRIANGLES,0,6);var r=this.particleStateTexture0;this.particleStateTexture0=this.particleStateTexture1,this.particleStateTexture1=r}}export{h as dotz};
