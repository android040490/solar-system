import * as THREE from "three";
import Experience from "./Experience";
import {
  UnrealBloomPass,
  ShaderPass,
  OutputPass,
  RenderPass,
  EffectComposer,
} from "three/examples/jsm/Addons.js";
import vertexShader from "../shaders/bloomPass/vertex.glsl";
import fragmentShader from "../shaders/bloomPass/fragment.glsl";
import Sizes from "./Utils/Sizes";
import Camera from "./Camera";
import Debug from "./Utils/Debug";
import GUI from "lil-gui";

export const BLOOM_SCENE = 1;

export default class Renderer {
  private readonly experience: Experience;
  private readonly canvas: HTMLCanvasElement;
  private readonly sizes: Sizes;
  private readonly scene: THREE.Scene;
  private readonly camera: Camera;
  private readonly debug: Debug;
  private readonly bloomLayer: THREE.Layers;
  private readonly instance: THREE.WebGLRenderer;
  private bloomPass!: UnrealBloomPass;
  private bloomComposer!: EffectComposer;
  private finalComposer!: EffectComposer;
  private materials: Record<string, THREE.Material> = {};
  private debugFolder?: GUI;
  private bloomEnabled = true;
  private readonly darkMaterial = new THREE.MeshBasicMaterial({
    color: "black",
  });
  private readonly bloomParams = {
    threshold: 1,
    strength: 0.7,
    radius: 0,
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
    this.instance = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.darkenNonBloomed = this.darkenNonBloomed.bind(this);
    this.restoreMaterial = this.restoreMaterial.bind(this);

    this.init();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  resize(): void {
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);
    this.bloomComposer.setSize(this.sizes.width, this.sizes.height);
    this.finalComposer.setSize(this.sizes.width, this.sizes.height);
  }

  update(): void {
    if (this.bloomEnabled) {
      this.scene.traverse(this.darkenNonBloomed);
      this.bloomComposer.render();
      this.scene.traverse(this.restoreMaterial);
      this.finalComposer.render();
    } else {
      this.instance.render(this.scene, this.camera.instance);
    }
  }

  dispose(): void {
    this.instance.dispose();
  }

  private init(): void {
    // this.instance.toneMapping = THREE.CineonToneMapping;
    // this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.instance.setClearColor("#000011");
    this.instance.setSize(this.sizes.width, this.sizes.height);
    this.instance.setPixelRatio(this.sizes.pixelRatio);

    this.setBloomPostProcessing();
  }

  private setBloomPostProcessing(): void {
    const scenePass = new RenderPass(this.scene, this.camera.instance);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.sizes.width, this.sizes.height),
      1.5,
      0.4,
      0.85,
    );
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

    this.finalComposer = new EffectComposer(this.instance);
    this.finalComposer.addPass(scenePass);
    this.finalComposer.addPass(mixPass);
    this.finalComposer.addPass(outputPass);
  }

  private darkenNonBloomed(obj: THREE.Object3D): void {
    if (
      this.bloomLayer.test(obj.layers) === false &&
      obj instanceof THREE.Mesh &&
      obj.isMesh
    ) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  }

  private restoreMaterial(obj: THREE.Object3D): void {
    if (this.materials[obj.uuid] && obj instanceof THREE.Mesh) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }

  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("Renderer");

    this.debugFolder?.add(this, "bloomEnabled");

    const bloomFolder = this.debugFolder?.addFolder("Bloom");
    bloomFolder
      ?.add(this.bloomParams, "threshold", 0.0, 5.0)
      .onChange((value: number) => {
        this.bloomPass.threshold = Number(value);
        this.update();
      });

    bloomFolder
      ?.add(this.bloomParams, "strength", 0.0, 3)
      .onChange((value: number) => {
        this.bloomPass.strength = Number(value);
        this.update();
      });

    bloomFolder
      ?.add(this.bloomParams, "radius", 0.0, 10.0)
      .step(0.01)
      .onChange((value: number) => {
        this.bloomPass.radius = Number(value);
        this.update();
      });
  }
}
