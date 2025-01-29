import * as THREE from "three";
import earthVertexShader from "../../shaders/earth/vertex.glsl";
import earthFragmentShader from "../../shaders/earth/fragment.glsl";
import atmosphereVertexShader from "../../shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../../shaders/atmosphere/fragment.glsl";
import GUI from "lil-gui";
import OrbitalObject from "../../models/orbital-object";
import SpaceObject from "../../models/space-object";

interface EarthOptions {
  parentObject: SpaceObject;
}

export default class Earth extends OrbitalObject {
  private group?: THREE.Group;
  private geometry?: THREE.BufferGeometry;
  private earthDayTexture?: THREE.Texture;
  private earthNightTexture?: THREE.Texture;
  private earthSpecularCloudsTexture?: THREE.Texture;
  private surfaceMaterial?: THREE.ShaderMaterial;
  private atmosphereMaterial?: THREE.ShaderMaterial;
  private surfaceMesh?: THREE.Mesh;
  private atmosphereMesh?: THREE.Mesh;
  private sunPosition?: THREE.Vector3;
  private debugFolder?: GUI;

  private atmosphereTwilightColor = "#ff6600";
  private atmosphereDayColor = "#00aaff";
  private cloudsIntencity = 0.5;

  constructor(options: EarthOptions) {
    super({
      ...options,
      name: "Earth",
      radius: 1,
      orbitRadius: 500,
      orbitSpeed: Math.random() * 0.1, // TODO: change this to not be hardcoded
      offsetAngle: Math.random() * Math.PI * 2, // TODO: change this to not be hardcoded
      markerColor: "#2e6faf",
    });

    this.sunPosition =
      this.experience.world?.sun?.position ?? new THREE.Vector3(0, 0, 0); // TODO: maybe change this to not be hardcoded

    this.loadTextures().then(() => this.init());
  }

  update(): void {
    super.update();
    if (this.group) {
      this.group.rotation.y = this.time.elapsed * 0.0001;
      this.group.position.copy(this.position);
    }
  }

  private async loadTextures(): Promise<void> {
    const [earthDayTexture, earthNightTexture, earthSpecularCloudsTexture] =
      await this.resources.loadTextures([
        "textures/planets/earth/day_8k.jpg",
        "textures/planets/earth/night_8k.jpg",
        "textures/planets/earth/specularClouds.jpg",
      ]);

    this.earthDayTexture = earthDayTexture;
    this.earthNightTexture = earthNightTexture;
    this.earthSpecularCloudsTexture = earthSpecularCloudsTexture;
  }

  protected setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  protected setTexture(): void {
    if (this.earthDayTexture) {
      this.earthDayTexture.colorSpace = THREE.SRGBColorSpace;
      this.earthDayTexture.anisotropy = 8;
    }
    if (this.earthNightTexture) {
      this.earthNightTexture.colorSpace = THREE.SRGBColorSpace;
      this.earthNightTexture.anisotropy = 8;
    }
    if (this.earthSpecularCloudsTexture) {
      this.earthSpecularCloudsTexture.anisotropy = 8;
    }
  }

  protected setMaterial(): void {
    this.surfaceMaterial = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        uDayTexture: new THREE.Uniform(this.earthDayTexture),
        uNightTexture: new THREE.Uniform(this.earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(
          this.earthSpecularCloudsTexture,
        ),
        uSunPosition: new THREE.Uniform(this.sunPosition),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereTwilightColor),
        ),
        uCloudsIntencity: new THREE.Uniform(this.cloudsIntencity),
      },
    });

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uSunPosition: new THREE.Uniform(this.sunPosition),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereTwilightColor),
        ),
      },
      side: THREE.BackSide,
      transparent: true,
    });
  }

  protected setMesh(): void {
    this.group = new THREE.Group();
    this.surfaceMesh = new THREE.Mesh(this.geometry, this.surfaceMaterial);

    this.atmosphereMesh = new THREE.Mesh(
      this.geometry,
      this.atmosphereMaterial,
    );
    this.atmosphereMesh.scale.set(1.04, 1.04, 1.04);

    this.group.position.copy(this.position);
    this.group.add(this.surfaceMesh, this.atmosphereMesh);
    this.scene.add(this.group);
  }

  protected setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("Earth");
    this.debugFolder?.addColor(this, "atmosphereDayColor").onChange(() => {
      this.surfaceMaterial?.uniforms.uAtmosphereDayColor.value.set(
        this.atmosphereDayColor,
      );
      this.atmosphereMaterial?.uniforms.uAtmosphereDayColor.value.set(
        this.atmosphereDayColor,
      );
    });
    this.debugFolder?.addColor(this, "atmosphereTwilightColor").onChange(() => {
      this.surfaceMaterial?.uniforms.uAtmosphereTwilightColor.value.set(
        this.atmosphereTwilightColor,
      );
      this.atmosphereMaterial?.uniforms.uAtmosphereTwilightColor.value.set(
        this.atmosphereTwilightColor,
      );
    });
    this.debugFolder
      ?.add(this, "cloudsIntencity")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        if (this.surfaceMaterial) {
          this.surfaceMaterial.uniforms.uCloudsIntencity.value =
            this.cloudsIntencity;
        }
      });
  }
}
