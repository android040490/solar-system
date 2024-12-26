import Experience from "../Experience";
import Earth from "./Earth";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.resources.on("ready", () => {
      this.earth = new Earth();
    });
  }

  update() {
    this.earth?.update();
  }
}
