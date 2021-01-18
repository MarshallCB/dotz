import { drawVert, drawFrag, quadVert, screenFrag, updateFrag} from './shaders'
import { createShader, createProgram, createTexture, bindTexture, createBuffer, bindAttribute, bindFramebuffer} from './utils'

const terrains = new Map()

/**
 * TODO
 * - Make options properties with setters that affect windgl instance
 * - allow for functional images (not only bitmaps)
 * - optimize code usage  / refactor
 * - make it a custom web element component with webreflection loader
 * - Detect motion preferences
 * - Listen for window resize
 */

export function dotz(canvas, terrain, options){
  let gl = canvas.getContext('webgl', {antialiasing: false})
  let wind = new WindGL(gl, terrain, options);

  function frame(){
    wind.draw()
    requestAnimationFrame(frame)
  }

  frame();
  return wind;
}


let options_defaults = {
  fade: 0.96,
  colors: {
    "0.0": "#000",
    "1.0": "#fff"
  },
  speed: 0.5,
  dropRate: 0.01,
  dropRateBump: 0.01,
  particles: 1e5,
  windData: {
    width: 360,
    height: 180,
    uMin: -20,
    uMax: 20,
    vMin: -20,
    vMax: 20
  }
}

class WindGL{
  constructor(gl, terrain, options){
    this.gl = gl
    Object.assign(this, options_defaults, options)
    this.drawProgram = createProgram(gl, drawVert, drawFrag);
    this.screenProgram = createProgram(gl, quadVert, screenFrag);
    this.updateProgram = createProgram(gl, quadVert, updateFrag);
    this.quadBuffer = createBuffer(gl, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]));
    this.framebuffer = gl.createFramebuffer();
    this.ready = false
    this.setTerrain = this.setTerrain.bind(this)
    this.setTerrain(terrain);
    this.resize();
  }

  get particles(){
    return this._particles;
  }

  set particles(particles){
    var gl = this.gl;

    // we create a square texture where each pixel will hold a particle position encoded as RGBA
    var particleRes = this.particleStateResolution = Math.ceil(Math.sqrt(particles));
    this._particles = particleRes * particleRes;

    var particleState = new Uint8Array(this._particles * 4);
    for (var i = 0; i < particleState.length; i++) {
        particleState[i] = Math.floor(Math.random() * 256); // randomize the initial particle positions
    }
    // textures to hold the particle state for the current and the next frame
    this.particleStateTexture0 = createTexture(gl, gl.NEAREST, particleState, particleRes, particleRes);
    this.particleStateTexture1 = createTexture(gl, gl.NEAREST, particleState, particleRes, particleRes);

    var particleIndices = new Float32Array(this._particles);
    for (var i$1 = 0; i$1 < this._particles; i$1++) { particleIndices[i$1] = i$1; }
    this.particleIndexBuffer = createBuffer(gl, particleIndices);
  }

  resize(){
    var gl = this.gl;
    var emptyPixels = new Uint8Array(gl.canvas.width * gl.canvas.height * 4);
    // screen textures to hold the drawn screen for the previous and the current frame
    this.backgroundTexture = createTexture(gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height);
    this.screenTexture = createTexture(gl, gl.NEAREST, emptyPixels, gl.canvas.width, gl.canvas.height);
  }

  set colors(colors){
    this._colors = colors
    var colorCanvas = document.createElement("canvas");
    var ctx = colorCanvas.getContext("2d");
    colorCanvas.width = 16;
    colorCanvas.height = 1
    var gradient = ctx.createLinearGradient(0, 0, 16, 0);
    for (var stop in colors) {
      gradient.addColorStop(Number(stop), colors[stop]);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 16, 1);
    let colorData = new Uint8Array(ctx.getImageData(0, 0, 16, 1).data);
    this.colorRampTexture = createTexture(this.gl, this.gl.LINEAR, colorData, 4, 4);
  }
  get colors(){
    return this._colors;
  }

  setTerrain(url){
    if(terrains.has(url)){
      this.ready = true
      this.windTexture = createTexture(this.gl, this.gl.LINEAR, terrains.get(url))
    }
    else {
      const windImage = new Image();
      const again = this.setTerrain
      windImage.src = url;
      windImage.onload = function(){
        createImageBitmap(this).then(res => {
          terrains.set(url, res);
          // first if statement will be true now
          again()
        });
      };
    }
  }

  draw(){
    if(this.ready){
      var gl = this.gl;
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.STENCIL_TEST);
  
      bindTexture(gl, this.windTexture, 0);
      bindTexture(gl, this.particleStateTexture0, 1);
  
      this.drawScreen();
      this.updateParticles();
    }
  }

  drawScreen(){
    var gl = this.gl;
    // draw the screen into a temporary framebuffer to retain it as the background on the next frame
    bindFramebuffer(gl, this.framebuffer, this.screenTexture);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    this.drawTexture(this.backgroundTexture, this.fade);
    this.drawParticles();

    bindFramebuffer(gl, null);
    // enable blending to support drawing on top of an existing background (e.g. a map)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.drawTexture(this.screenTexture, 1.0);
    gl.disable(gl.BLEND);

    // save the current screen as the background for the next frame
    var temp = this.backgroundTexture;
    this.backgroundTexture = this.screenTexture;
    this.screenTexture = temp;
  }

  drawTexture(texture, opacity){
    var gl = this.gl;
    var program = this.screenProgram;
    gl.useProgram(program.program);

    bindAttribute(gl, this.quadBuffer, program.a_pos, 2);
    bindTexture(gl, texture, 2);
    gl.uniform1i(program.u_screen, 2);
    gl.uniform1f(program.u_opacity, opacity);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawParticles(){
    var gl = this.gl;
    var program = this.drawProgram;
    gl.useProgram(program.program);

    bindAttribute(gl, this.particleIndexBuffer, program.a_index, 1);
    bindTexture(gl, this.colorRampTexture, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);
    gl.uniform1i(program.u_color_ramp, 2);

    gl.uniform1f(program.u_particles_res, this.particleStateResolution);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);

    gl.drawArrays(gl.POINTS, 0, this._particles);
  }

  updateParticles() {
    var gl = this.gl;
    bindFramebuffer(gl, this.framebuffer, this.particleStateTexture1);
    gl.viewport(0, 0, this.particleStateResolution, this.particleStateResolution);

    var program = this.updateProgram;
    gl.useProgram(program.program);

    bindAttribute(gl, this.quadBuffer, program.a_pos, 2);

    gl.uniform1i(program.u_wind, 0);
    gl.uniform1i(program.u_particles, 1);

    gl.uniform1f(program.u_rand_seed, Math.random());
    gl.uniform2f(program.u_wind_res, this.windData.width, this.windData.height);
    gl.uniform2f(program.u_wind_min, this.windData.uMin, this.windData.vMin);
    gl.uniform2f(program.u_wind_max, this.windData.uMax, this.windData.vMax);
    gl.uniform1f(program.u_speed_factor, this.speed);
    gl.uniform1f(program.u_drop_rate, this.dropRate);
    gl.uniform1f(program.u_drop_rate_bump, this.dropRateBump);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // swap the particle state textures so the new one becomes the current one
    var temp = this.particleStateTexture0;
    this.particleStateTexture0 = this.particleStateTexture1;
    this.particleStateTexture1 = temp;
  }

}