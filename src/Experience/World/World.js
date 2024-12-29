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
    this.earth = new Earth();
    this.spaceObjects = [
      this.sun,
      this.earth,
      new Planet({
        name: "Mars",
        radius: 1.06,
        texture: this.resources.items.marsDay,
        distanceToSun: 30,
        pointOfView: { x: 0, y: 0, z: 10 },
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
