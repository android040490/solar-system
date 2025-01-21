import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import EventEmitter from "eventemitter3";
// import gsap from "gsap";

type SourceType = "texture" | "gltfModel";

export interface Source {
  name: string;
  type: SourceType;
  path: string;
}

interface Loaders {
  texture: THREE.TextureLoader;
  gltfModel: GLTFLoader;
}

export default class Resources extends EventEmitter {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly loaders: Loaders;
  private _textures: Map<string, THREE.Texture> = new Map();

  constructor(sources: Source[]) {
    super();

    this.loadingManager = new THREE.LoadingManager();
    this.loaders = {
      texture: new THREE.TextureLoader(this.loadingManager),
      gltfModel: new GLTFLoader(this.loadingManager),
    };

    this.listenLoadingEvents();
    this.startLoading(sources);
  }

  get textures(): Map<string, THREE.Texture> {
    return this._textures;
  }

  private startLoading(sources: Source[]): void {
    for (const source of sources) {
      this.loaders[source.type].load(source.path, (file) => {
        if (file instanceof THREE.Texture) {
          this.textureLoaded(source, file);
        }
      });
    }
  }

  private textureLoaded(source: Source, file: THREE.Texture): void {
    this._textures.set(source.name, file);
  }

  private listenLoadingEvents(): void {
    this.loadingManager.onLoad = () => {
      this.emit("ready");
    };
    this.loadingManager.onProgress = (_: string, loaded, total) => {
      const progress = loaded / total;
      this.emit("progress", progress);
    };
  }
}
