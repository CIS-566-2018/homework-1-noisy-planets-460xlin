import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 6,
  'Load Scene': loadScene, // A function pointer, essentially
  R: 1,
  G: 0,
  B: 0,
  lambert : chooseLambert,
  custom : chooseCuestom,
  perlin : choosePerlin,
  terrian_height: 1.,
  cloud_speed: 1.,
  cloud_density: 1.,

};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let thisShader: ShaderProgram;
let lambert: ShaderProgram;
let customShader: ShaderProgram;
let perlin: ShaderProgram;
let cloud: ShaderProgram;
let vertS: Shader;
let fragS: Shader;
let mTime: number;
let mRadius: number;

let openPlanet : boolean;


function chooseLambert(){
thisShader = lambert;
openPlanet = false;
}

function chooseCuestom(){
thisShader = customShader;
openPlanet = false;
}

function choosePerlin(){
  openPlanet = true;
}


function loadScene() {
  mRadius = 1;
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), mRadius, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  mTime = 0;
  openPlanet = false;
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'R', 0, 1).step(0.1);
  gui.add(controls, 'G', 0, 1).step(0.1);
  gui.add(controls, 'B', 0, 1).step(0.1);
  
  // gui.add(controls, 'myShader' );
  gui.add(controls, 'lambert');
  gui.add(controls, 'custom');
  gui.add(controls, 'perlin');
  gui.add(controls, 'terrian_height', 0.5, 1).step(0.1);
  gui.add(controls, 'cloud_speed', 0, 1).step(0.1);
  gui.add(controls, 'cloud_density', 0.1, 1).step(0.1);

    // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);



  lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  customShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  perlin = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/perlin-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/perlin-frag.glsl')),
  ])

  cloud = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/cloud-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/cloud-frag.glsl')),
  ])




  thisShader = lambert;

  
  var cl = vec4.fromValues(0, 0, 0, 1);
  var mTerH = 1.;
  var mCloudS = 1.;
  var mCloudD = 1.;
  // This function will be called every frame
  function tick() {
    mTime = mTime + 1.0;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    cl = vec4.fromValues(controls.R, controls.G, controls.B, 1);
    mTerH = controls.terrian_height;
    mCloudS = controls.cloud_speed;
    mCloudD = controls.cloud_density;
    if(openPlanet){

      renderer.render(camera, lambert, [
        icosphere,
        //cube,
      ], cl, mTime, mRadius, mTerH, mCloudS, mCloudD);
  
      renderer.render(camera, perlin, [
        icosphere,
        //cube,
      ], cl, mTime, mRadius, mTerH, mCloudS, mCloudD);

      renderer.render(camera, cloud, [
        icosphere,
        //cube,
      ], cl, mTime, mRadius, mTerH, mCloudS, mCloudD);
    }
    else{
      renderer.render(camera, thisShader, [
        icosphere,
        //cube,
      ], cl, mTime, mRadius, mTerH, mCloudS, mCloudD);
    }



    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
 