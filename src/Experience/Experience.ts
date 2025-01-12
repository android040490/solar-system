import * as THREE from "three";
import Stats from "stats.js";
import Sizes from "./Utils/Sizes";
import Time from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources from "./Utils/Resources";
import sources from "./sources";
import Debug from "./Utils/Debug";
import Navigator from "./World/Navigator";

let instance: Experience;

export default class Experience {
  public readonly canvas!: HTMLCanvasElement;
  public readonly debug!: Debug;
  public readonly sizes!: Sizes;
  public readonly time!: Time;
  public readonly scene!: THREE.Scene;
  public readonly resources!: Resources;
  public readonly camera!: Camera;
  public readonly renderer!: Renderer;
  public readonly navigation!: Navigator;
  public readonly world!: World;

  private stats?: Stats;

  constructor() {
    if (instance) {
      return instance;
    }

    // window.experience = this;

    instance = this;
    // Options
    this.canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources(sources);
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.navigation = new Navigator();
    this.world = new World();

    // Sizes resize event
    this.sizes.on("resize", () => {
      this.resize();
    });

    // Time tick event
    this.time.on("tick", () => {
      this.update();
    });

    if (this.debug.active) {
      this.setDebug();
    }
  }

  destroy(): void {
    this.sizes.off("resize");
    this.time.off("tick");

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.dispose();
    this.renderer.dispose();

    if (this.debug.active) {
      this.debug.destroy();
    }
  }

  private resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }

  private update(): void {
    if (this.debug.active) {
      this.stats?.begin();
    }
    this.camera.update();
    this.world.update();
    this.renderer.update();
    if (this.debug.active) {
      this.stats?.end();
    }
  }

  private setDebug(): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }
}