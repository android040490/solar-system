import * as THREE from "three";
import OrbitalObject, {
  OrbitalObjectOptions,
} from "../../models/orbital-object";

interface PlanetOptions extends OrbitalObjectOptions {
  name: string;
  radius: number;
  textureFilePath: string;
}

export default class Planet extends OrbitalObject {
  private texture?: THREE.Texture;
  private material?: THREE.Material;
  private geometry?: THREE.BufferGeometry;
  private mesh?: THREE.Mesh;

  constructor(options: PlanetOptions) {
    super(options);

    const { textureFilePath } = options;

    this.loadTexture(textureFilePath).then(() => {
      this.init();
    });
  }

  update(): void {
    super.update();
    if (this.mesh) {
      this.mesh.rotation.y = this.time.elapsed * 0.0001;
      this.mesh.position.copy(this.position);
    }
  }

  private async loadTexture(path: string): Promise<void> {
    this.texture = await this.resources.loadTexture(path);
  }

  protected setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  protected setTexture(): void {
    if (this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.anisotropy = 8;
    }
  }

  protected setMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
  }

  protected setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }
}
