import * as THREE from "three";
import earthVertexShader from "../../shaders/earth/vertex.glsl";
import earthFragmentShader from "../../shaders/earth/fragment.glsl";
import atmosphereVertexShader from "../../shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../../shaders/atmosphere/fragment.glsl";
import Resources from "../Utils/Resources";
import Debug from "../Utils/Debug";
import GUI from "lil-gui";
import { PointOfView } from "../../models/navigation";
import Experience from "../Experience";
import Time from "../Utils/Time";
import { SpaceObject } from "../../models/space-object";

interface EarthOptions {
  radius: number;
  distanceToSun: number;
  pointOfView: PointOfView;
}

export default class Earth implements SpaceObject {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly time: Time;
  private readonly debug: Debug;
  private readonly resources: Resources;
  private readonly radius: number;
  private readonly spherical: THREE.Spherical;

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

  public readonly name = "Earth";
  public readonly pointOfView: PointOfView;

  constructor(options: EarthOptions) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    const { radius, distanceToSun, pointOfView } = options;
    this.radius = radius;
    this.pointOfView = pointOfView;
    this.sunPosition =
      this.experience.world?.sun?.position ?? new THREE.Vector3(0, 0, 0); // TODO: maybe change this to not be hardcoded
    this.spherical = new THREE.Spherical(
      distanceToSun,
      Math.PI * 0.5,
      Math.PI * 0.5,
    );

    this.loadTextures().then(() => this.init());
  }

  get position(): THREE.Vector3 {
    return new THREE.Vector3().setFromSpherical(this.spherical);
  }

  update(): void {
    if (this.group) {
      this.group.rotation.y = this.time.elapsed * 0.0001;
    }
  }

  private async loadTextures(): Promise<void> {
    const [earthDayTexture, earthNightTexture, earthSpecularCloudsTexture] =
      await this.resources.loadTextures([
        "textures/planets/earth/day.jpg",
        "textures/planets/earth/night.jpg",
        "textures/planets/earth/specularClouds.jpg",
      ]);

    this.earthDayTexture = earthDayTexture;
    this.earthNightTexture = earthNightTexture;
    this.earthSpecularCloudsTexture = earthSpecularCloudsTexture;
  }

  private init(): void {
    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();
    if (this.debug.active) {
      this.setDebug();
    }
  }

  private setGeometry(): void {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  private setTexture(): void {
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

  private setMaterial(): void {
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

  private setMesh(): void {
    this.group = new THREE.Group();
    this.surfaceMesh = new THREE.Mesh(this.geometry, this.surfaceMaterial);

    this.atmosphereMesh = new THREE.Mesh(
      this.geometry,
      this.atmosphereMaterial,
    );
    this.atmosphereMesh.scale.set(1.04, 1.04, 1.04);

    this.group.position.setFromSpherical(this.spherical);
    this.group.add(this.surfaceMesh, this.atmosphereMesh);
    this.scene.add(this.group);
  }

  private setDebug(): void {
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
    this.debugFolder
      ?.add(this.spherical, "phi")
      .min(0)
      .max(Math.PI)
      .step(0.001)
      .onChange(() => this.updatePosition());
    this.debugFolder
      ?.add(this.spherical, "theta")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .onChange(() => this.updatePosition());
  }

  private updatePosition(): void {
    if (this.group) {
      this.group.position.setFromSpherical(this.spherical);
    }
  }
}
