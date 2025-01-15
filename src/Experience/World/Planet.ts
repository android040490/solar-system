import * as THREE from "three";
import Experience from "../Experience";
import Time from "../Utils/Time";
import { PointOfView } from "../../models/navigation";
import { SpaceObject } from "../../models/space-object";

interface PlanetOptions {
  name: string;
  radius: number;
  distanceToSun: number;
  pointOfView: PointOfView;
  textureKey: string;
}

export default class Planet implements SpaceObject {
  private readonly experience: Experience;
  private readonly time: Time;
  private readonly scene: THREE.Scene;
  private readonly radius: number;
  private readonly distanceToSun: number;

  private _mesh!: THREE.Mesh;
  private geometry!: THREE.BufferGeometry;
  private spherical!: THREE.Spherical;
  private material!: THREE.Material;
  private texture?: THREE.Texture;

  public readonly pointOfView: PointOfView;
  public readonly name: string;

  constructor(options: PlanetOptions) {
    const { name, radius, textureKey, distanceToSun, pointOfView } = options;
    this.name = name;
    this.radius = radius;
    this.distanceToSun = distanceToSun;
    this.pointOfView = pointOfView;

    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.texture = this.experience.resources.textures.get(textureKey);

    this.init();
  }

  get mesh(): THREE.Mesh {
    return this._mesh;
  }

  update(): void {
    this.mesh.rotation.y = this.time.elapsed * 0.0001;
  }

  private setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  private init(): void {
    this.setGeometry();
    this.configureTexture();
    this.setMaterial();
    this.setMesh();
  }

  private configureTexture(): void {
    if (this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.anisotropy = 8;
    }
  }

  private setMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
  }

  private setMesh(): void {
    this.spherical = new THREE.Spherical(
      this.distanceToSun,
      Math.PI * 0.5,
      Math.PI * 0.5,
    );
    this._mesh = new THREE.Mesh(this.geometry, this.material);
    this._mesh.position.setFromSpherical(this.spherical);
    this.scene.add(this._mesh);
  }
}
