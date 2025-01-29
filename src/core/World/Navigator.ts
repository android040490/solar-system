import Experience from "../Experience";
import { NavigableObject } from "../../models/navigation";
import Camera from "../Camera";
import GUI from "lil-gui";
import Debug from "../Utils/Debug";

export default class Navigator {
  private readonly camera: Camera;
  private readonly debug: Debug;
  private _navigableObjects: NavigableObject[] = [];
  private debugFolder?: GUI;

  constructor() {
    const experience = new Experience();
    this.camera = experience.camera;
    this.debug = experience.debug;
    this._navigableObjects = experience.world.spaceObjects;

    if (this.debug.active) {
      this.setDebug();
    }
  }

  get navigableObjects(): NavigableObject[] {
    return this._navigableObjects;
  }

  navigateTo(object: NavigableObject): void {
    this.camera.followObject(object);
  }

  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("Navigator");

    this._navigableObjects.forEach((spaceObject) => {
      const obj = {
        navigateTo: () => {
          this.navigateTo(spaceObject);
        },
      };
      this.debugFolder?.add(obj, "navigateTo").name(spaceObject.name);
    });
  }
}
