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

  private radius = 20;
  private geometry!: THREE.BufferGeometry;
  private material!: THREE.ShaderMaterial;
  private _mesh!: THREE.Mesh;
  private lavaTexture?: THREE.Texture;
  private cloudTexture?: THREE.Texture;

  public readonly name = "Sun";
  public readonly pointOfView = { x: 0, y: 0, z: 55 };

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    this.init();
  }

  update(): void {
    this.material.uniforms.time.value += 0.0005 * this.time.delta;
  }

  get mesh(): THREE.Mesh {
    return this._mesh;
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

  private setTexture(): void {
    this.lavaTexture = this.resources.textures.get("sunLava");
    this.cloudTexture = this.resources.textures.get("sunCloud");
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
    this._mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this._mesh);
    this._mesh.layers.enable(BLOOM_SCENE);
  }
}
