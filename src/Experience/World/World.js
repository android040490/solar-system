import Experience from "../Experience";
import Earth from "./Earth";
import Sun from "./Sun";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      this.sun = new Sun();
      this.earth = new Earth();
    });
  }

  update() {
    this.earth?.update();
  }
}
