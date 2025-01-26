import Experience from "../Experience";
import { ViewableObject } from "../../models/navigation";
import Camera from "../Camera";

export default class Navigator {
  private readonly camera: Camera;

  constructor() {
    this.camera = new Experience().camera;
  }

  navigateTo(viewableObject: ViewableObject): void {
    this.camera.followObject(viewableObject);
  }
}
