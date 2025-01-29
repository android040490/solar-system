import Earth from "./Earth";
import Environment from "./Environment";
import Planet from "./Planet";
import Sun from "./Sun";
import SpaceObject from "../../models/space-object";

export default class World {
  private _sun?: Sun;
  private _spaceObjects: SpaceObject[] = [];

  constructor() {
    this.setup();
  }

  get sun(): Sun | undefined {
    return this._sun;
  }

  get spaceObjects(): SpaceObject[] {
    return this._spaceObjects;
  }

  private setup(): void {
    new Environment();

    this._sun = new Sun();
    this._spaceObjects = [
      this._sun,
      new Planet({
        name: "Mercury",
        radius: 0.38,
        textureFilePath: "textures/planets/mercury/mercury_2k.jpg",
        orbitRadius: 350,
        parentObject: this._sun,
        orbitSpeed: Math.random() * 0.1, // TODO: change this to not be hardcoded and avoid code duplication, maybe create a planet factory
        offsetAngle: Math.random() * Math.PI * 2, // TODO: change this to not be hardcoded and avoid code duplication, maybe create a planet factory
        markerColor: "#696969",
      }),
      new Planet({
        name: "Venus",
        radius: 0.94,
        textureFilePath: "textures/planets/venus/venus_surface_2k.jpg",
        orbitRadius: 450,
        parentObject: this._sun,
        orbitSpeed: Math.random() * 0.1,
        offsetAngle: Math.random() * Math.PI * 2,
        markerColor: "#eea046",
      }),
      new Earth({
        parentObject: this._sun,
      }),
      new Planet({
        name: "Mars",
        radius: 0.53,
        textureFilePath: "textures/planets/mars/mars_2k.jpg",
        orbitRadius: 650,
        parentObject: this._sun,
        orbitSpeed: Math.random() * 0.1,
        offsetAngle: Math.random() * Math.PI * 2,
        markerColor: "#d3613f",
      }),
      new Planet({
        name: "Jupiter",
        radius: 10.96,
        textureFilePath: "textures/planets/jupiter/jupiter_2k.jpg",
        orbitRadius: 900,
        parentObject: this._sun,
        orbitSpeed: Math.random() * 0.1,
        offsetAngle: Math.random() * Math.PI * 2,
        markerColor: "#696158",
      }),
    ];
  }

  update(): void {
    this._spaceObjects.forEach((spaceObject) => {
      spaceObject.update();
    });
  }
}
