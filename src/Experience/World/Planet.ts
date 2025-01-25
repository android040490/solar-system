import * as THREE from "three";
import Experience from "../Experience";
import Time from "../Utils/Time";
import { PointOfView } from "../../models/navigation";
import { SpaceObject } from "../../models/space-object";
import Resources from "../Utils/Resources";

interface PlanetOptions {
  name: string;
  radius: number;
  distanceToSun: number;
  pointOfView: PointOfView;
  textureFilePath: string;
}

export default class Planet implements SpaceObject {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly time: Time;
  private readonly radius: number;
  private readonly spherical: THREE.Spherical;

  private texture?: THREE.Texture;
  private material?: THREE.Material;
  private geometry?: THREE.BufferGeometry;
  private mesh?: THREE.Mesh;

  public readonly name: string;
  public readonly pointOfView: PointOfView;

  constructor(options: PlanetOptions) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    const { name, radius, textureFilePath, distanceToSun, pointOfView } =
      options;
    this.name = name;
    this.radius = radius;
    this.pointOfView = pointOfView;
    this.spherical = new THREE.Spherical(
      distanceToSun,
      Math.PI * 0.5,
      Math.PI * 0.5,
    );

    this.loadTexture(textureFilePath).then(() => {
      this.init();
    });
  }

  get position(): THREE.Vector3 {
    return new THREE.Vector3().setFromSpherical(this.spherical);
  }

  update(): void {
    if (this.mesh) {
      this.mesh.rotation.y = this.time.elapsed * 0.0001;
    }
  }

  private async loadTexture(path: string): Promise<void> {
    this.texture = await this.resources.loadTexture(path);
  }

  private init(): void {
    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();
  }

  private setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  private setTexture(): void {
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
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.setFromSpherical(this.spherical);
    this.scene.add(this.mesh);
  }
}
