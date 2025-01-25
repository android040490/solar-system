import * as THREE from "three";
import Experience from "../Experience";
import vertexShader from "../../shaders/sun/vertex.glsl";
import fragmentShader from "../../shaders/sun/fragment.glsl";
import { BLOOM_SCENE } from "../Renderer";
import Time from "../Utils/Time";
import Resources from "../Utils/Resources";
import { SpaceObject } from "../../models/space-object";

export default class Sun implements SpaceObject {
  private readonly experience: Experience;
  private readonly time: Time;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;

  private lavaTexture?: THREE.Texture;
  private cloudTexture?: THREE.Texture;
  private geometry?: THREE.BufferGeometry;
  private material?: THREE.ShaderMaterial;
  private mesh?: THREE.Mesh;

  private _position = new THREE.Vector3(0, 0, 0);
  private radius = 20;

  public readonly name = "Sun";
  public readonly pointOfView = { x: 0, y: 0, z: 55 };

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

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

  private init(): void {
    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();
  }

  private setGeometry(): void {
    this.geometry = new THREE.IcosahedronGeometry(this.radius, 62);
  }

  private async loadTextures(): Promise<void> {
    const [lavaTexture, cloudTexture] = await this.resources.loadTextures([
      "textures/sun/lavatile.jpg",
      "textures/sun/cloud.png",
    ]);

    this.lavaTexture = lavaTexture;
    this.cloudTexture = cloudTexture;
  }

  private setTexture(): void {
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

  private setMaterial(): void {
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

  private setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.mesh.layers.enable(BLOOM_SCENE);
  }
}
