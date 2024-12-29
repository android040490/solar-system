import * as THREE from "three";
import Experience from "./Experience";
import {
  UnrealBloomPass,
  ShaderPass,
  OutputPass,
  RenderPass,
  EffectComposer,
} from "three/examples/jsm/Addons.js";
import vertexShader from "../shaders/bloompass/vertex.glsl";
import fragmentShader from "../shaders/bloompass/fragment.glsl";

export const BLOOM_SCENE = 1;

export default class Renderer {
  materials = {};
  darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
  bloomEnabled = true;
  bloomParams = {
    threshold: 1,
    strength: 1,
    radius: 0.5,
  };

  constructor() {
    this.experience = new Experience();
    this.canvas = this.experience.canvas;
    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.camera = this.experience.camera;
    this.debug = this.experience.debug;

    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);

    this.darkenNonBloomed = this.darkenNonBloomed.bind(this);
    this.restoreMaterial = this.restoreMaterial.bind(this);

    this.init();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  init() {
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.instance.setClearColor("#000011");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.setBloomPostProcessing();
  }

  setBloomPostProcessing() {
    const scenePass = new RenderPass(this.scene, this.camera.instance);

    this.bloomPass = new UnrealBloomPass();
    this.bloomPass.threshold = this.bloomParams.threshold;
    this.bloomPass.strength = this.bloomParams.strength;
    this.bloomPass.radius = this.bloomParams.radius;
    this.bloomComposer = new EffectComposer(this.instance);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(scenePass);
    this.bloomComposer.addPass(this.bloomPass);

    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {},
      }),
      "baseTexture",
    );
    mixPass.needsSwap = true;

    const outputPass = new OutputPass();

    this.composer = new EffectComposer(this.instance);
    this.composer.addPass(scenePass);
    this.composer.addPass(mixPass);
    this.composer.addPass(outputPass);
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
  }

  darkenNonBloomed(obj) {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  }

  restoreMaterial(obj) {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Renderer");

    this.debugFolder.add(this, "bloomEnabled");

    const bloomFolder = this.debugFolder.addFolder("Bloom");
    bloomFolder
      .add(this.bloomParams, "threshold", 0.0, 5.0)
      .onChange((value) => {
        this.bloomPass.threshold = Number(value);
        this.update();
      });

    bloomFolder.add(this.bloomParams, "strength", 0.0, 3).onChange((value) => {
      this.bloomPass.strength = Number(value);
      this.update();
    });

    bloomFolder
      .add(this.bloomParams, "radius", 0.0, 10.0)
      .step(0.01)
      .onChange((value) => {
        this.bloomPass.radius = Number(value);
        this.update();
      });
  }

  update() {
    if (this.bloomEnabled) {
      this.scene.traverse(this.darkenNonBloomed);
      this.bloomComposer.render();
      this.scene.traverse(this.restoreMaterial);
      this.composer.render();
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }
  }
}
