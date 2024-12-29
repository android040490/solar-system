import * as THREE from "three";
import Experience from "../Experience";
import vertexShader from "../../shaders/sun/vertex.glsl";
import fragmentShader from "../../shaders/sun/fragment.glsl";

export default class Sun {
  name = "Sun";
  pointOfView = { x: 0, y: 0, z: 55 };

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.navigation = this.experience.navigation;

    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.IcosahedronGeometry(20, 62);
  }

  setTexture() {
    this.lavaTexture = this.resources.items.sunLava;
    this.lavaTexture.colorSpace = THREE.SRGBColorSpace;
    this.cloudTexture = this.resources.items.sunCloud;
    this.cloudTexture.wrapS = THREE.RepeatWrapping;
    this.cloudTexture.wrapT = THREE.RepeatWrapping;
    this.lavaTexture.wrapS = THREE.RepeatWrapping;
    this.lavaTexture.wrapT = THREE.RepeatWrapping;
  }

  setMaterial() {
    const uniforms = {
      fogDensity: { value: 0.45 },
      fogColor: { value: new THREE.Vector3(0, 0, 0) },
      time: { value: 1.0 },
      uvScale: { value: new THREE.Vector2(3.0, 1.0) },
      texture1: { value: this.cloudTexture },
      texture2: { value: this.lavaTexture },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader,
      fragmentShader,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  update() {
    this.material.uniforms.time.value += 0.0005 * this.time.delta;
  }
}
