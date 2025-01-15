import * as THREE from "three";
import Experience from "../Experience";
import Earth from "./Earth";
import Environment from "./Environment";
import Planet from "./Planet";
import Sun from "./Sun";
import Resources from "../Utils/Resources";
import Debug from "../Utils/Debug";
import Navigator from "./Navigator";
import GUI from "lil-gui";
import { SpaceObject } from "../../models/space-object";

export default class World {
  protected experience: Experience;
  protected scene: THREE.Scene;
  private resources!: Resources;
  private debug: Debug;
  private debugFolder?: GUI;
  private navigation: Navigator;
  public sun?: Sun;
  spaceObjects: SpaceObject[] = [];

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.navigation = this.experience.navigation;

    this.resources.on("ready", () => {
      this.setup();
    });
  }

  setup() {
    new Environment();

    this.sun = new Sun();
    this.spaceObjects = [
      this.sun,
      new Planet({
        name: "Mercury",
        radius: 0.38,
        textureKey: "mercury",
        distanceToSun: 35,
        pointOfView: { x: 0, y: 0, z: 3 },
      }),
      new Planet({
        name: "Venus",
        radius: 0.94,
        textureKey: "venusSurface",
        distanceToSun: 45,
        pointOfView: { x: 0, y: 0, z: 5 },
      }),
      new Earth({
        radius: 1,
        distanceToSun: 55,
        pointOfView: { x: 0, y: 0, z: 5 },
      }),
      new Planet({
        name: "Mars",
        radius: 0.53,
        textureKey: "mars",
        distanceToSun: 65,
        pointOfView: { x: 0, y: 0, z: 5 },
      }),
      new Planet({
        name: "Jupiter",
        radius: 10.96,
        textureKey: "jupiter",
        distanceToSun: 90,
        pointOfView: { x: 0, y: 0, z: 30 },
      }),
    ];

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setDebug() {
    this.debugFolder = this.debug.ui?.addFolder("Navigation");
    this.spaceObjects.forEach((spaceObject) => {
      const obj = {
        navigateTo: () => {
          this.navigation.navigateTo(spaceObject);
        },
      };
      this.debugFolder?.add(obj, "navigateTo").name(spaceObject.name);
    });
  }

  update() {
    this.spaceObjects.forEach((spaceObject) => {
      spaceObject.update();
    });
  }
}
