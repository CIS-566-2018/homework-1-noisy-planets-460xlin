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
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  R: 1,
  G: 0,
  B: 0,
  lambert : chooseLambert,
  custom : chooseCuestom,
//  SHADER: ""
//  lambert:
  //myShader: chooseShader,
 // 'color': loadColor,
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let thisShader: ShaderProgram;
let lambert: ShaderProgram;
let customShader: ShaderProgram;
let vertS: Shader;
let fragS: Shader;
let mTime: number;
function chooseLambert(){
thisShader = lambert;
}

function chooseCuestom(){
thisShader = customShader;
}


function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
  mTime = 0;
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


  lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  customShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  thisShader = lambert;

  
  var cl = vec4.fromValues(0, 0, 0, 1);
  // This function will be called every frame
  function tick() {
    mTime = mTime + 1.0;
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    cl = vec4.fromValues(controls.R, controls.G, controls.B, 1);
    renderer.render(camera, thisShader, [
      // icosphere,
      cube,
    ], cl, mTime);
    
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
 