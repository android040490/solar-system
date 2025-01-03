import Experience from "../Experience";
import Earth from "./Earth";
import Environment from "./Environment";
import Planet from "./Planet";
import Sun from "./Sun";

export default class World {
  spaceObjects = [];

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
    this.environment = new Environment();

    this.sun = new Sun();
    this.spaceObjects = [
      this.sun,
      new Planet({
        name: "Mercury",
        radius: 0.38,
        texture: this.resources.items.mercury,
        distanceToSun: 35,
        pointOfView: { x: 0, y: 0, z: 3 },
      }),
      new Planet({
        name: "Venus",
        radius: 0.94,
        texture: this.resources.items.venusSurface,
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
        texture: this.resources.items.mars,
        distanceToSun: 65,
        pointOfView: { x: 0, y: 0, z: 5 },
      }),
      new Planet({
        name: "Jupiter",
        radius: 10.96,
        texture: this.resources.items.jupiter,
        distanceToSun: 90,
        pointOfView: { x: 0, y: 0, z: 30 },
      }),
    ];

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Navigation");
    this.spaceObjects.forEach((spaceObject) => {
      const obj = {
        navigateTo: () => {
          this.navigation.navigateTo(spaceObject);
        },
      };
      this.debugFolder.add(obj, "navigateTo").name(spaceObject.name);
    });
  }

  update() {
    this.spaceObjects.forEach((spaceObject) => {
      spaceObject.update();
    });
  }
}
