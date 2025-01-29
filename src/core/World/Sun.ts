import * as THREE from "three";
import vertexShader from "../../shaders/sun/vertex.glsl";
import fragmentShader from "../../shaders/sun/fragment.glsl";
import { BLOOM_SCENE } from "../Renderer";
import SpaceObject from "../../models/space-object";

export default class Sun extends SpaceObject {
  private lavaTexture?: THREE.Texture;
  private cloudTexture?: THREE.Texture;
  private geometry?: THREE.BufferGeometry;
  private material?: THREE.ShaderMaterial;
  private mesh?: THREE.Mesh;

  private _position = new THREE.Vector3(0, 0, 0);

  constructor() {
    super({ name: "Sun", radius: 20, markerColor: "#ffff00" });

    this.loadTextures().then(() => this.init());
  }

  update(): void {
    if (this.material) {
      this.material.uniforms.time.value += 0.0005 * this.time.delta;
    }
  }

  get position(): THREE.Vector3 {
    return this._position;
  }

  protected setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 32, 32);
  }

  private async loadTextures(): Promise<void> {
    const [lavaTexture, cloudTexture] = await this.resources.loadTextures([
      "textures/sun/lavatile.jpg",
      "textures/sun/cloud.png",
    ]);

    this.lavaTexture = lavaTexture;
    this.cloudTexture = cloudTexture;
  }

  protected setTexture(): void {
    if (this.lavaTexture) {
      this.lavaTexture.colorSpace = THREE.SRGBColorSpace;
      this.lavaTexture.wrapS = THREE.RepeatWrapping;
      this.lavaTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.cloudTexture) {
      this.cloudTexture.wrapS = THREE.RepeatWrapping;
      this.cloudTexture.wrapT = THREE.RepeatWrapping;
    }
  }

  protected setMaterial(): void {
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

  protected setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.mesh.layers.enable(BLOOM_SCENE);
  }
}
