import Experience from "../Experience";
import { ViewableObject } from "../../models/navigation";
import Camera from "../Camera";
import GUI from "lil-gui";
import Debug from "../Utils/Debug";
import SpaceObject from "../../models/space-object";

export default class Navigator {
  private readonly camera: Camera;
  private readonly debug: Debug;
  private spaceObjects: SpaceObject[] = [];
  private debugFolder?: GUI;

  constructor() {
    const experience = new Experience();
    this.camera = experience.camera;
    this.debug = experience.debug;
    this.spaceObjects = experience.world.spaceObjects;

    if (this.debug.active) {
      this.setDebug();
    }
  }

  navigateTo(viewableObject: ViewableObject): void {
    this.camera.followObject(viewableObject);
  }

  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("Navigator");

    this.spaceObjects.forEach((spaceObject) => {
      const obj = {
        navigateTo: () => {
          this.navigateTo(spaceObject);
        },
      };
      this.debugFolder?.add(obj, "navigateTo").name(spaceObject.name);
    });
  }
}
