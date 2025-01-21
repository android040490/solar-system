import Experience from "../Experience";
import Earth from "./Earth";
import Environment from "./Environment";
import Planet from "./Planet";
import Sun from "./Sun";
import Debug from "../Utils/Debug";
import Navigator from "./Navigator";
import GUI from "lil-gui";
import { SpaceObject } from "../../models/space-object";
import eventsManager, { EventsManager } from "../Utils/EventsManager";
import { ResourcesEvent } from "../Utils/Resources";

export default class World {
  private experience: Experience;
  private debug: Debug;
  private navigation: Navigator;
  private debugFolder?: GUI;
  private _sun?: Sun;

  private readonly eventsManager: EventsManager = eventsManager;
  private spaceObjects: SpaceObject[] = [];

  constructor() {
    this.experience = new Experience();
    this.debug = this.experience.debug;
    this.navigation = this.experience.navigation;

    this.eventsManager.on(ResourcesEvent.Ready, () => {
      this.setup();
    });
  }

  get sun(): Sun | undefined {
    return this._sun;
  }

  private setup(): void {
    new Environment();

    this._sun = new Sun();
    this.spaceObjects = [
      this._sun,
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

  private setDebug(): void {
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

  update(): void {
    this.spaceObjects.forEach((spaceObject) => {
      spaceObject.update();
    });
  }
}
