import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import eventsManager, { EventsManager } from "./EventsManager";

type SourceType = "texture" | "gltfModel";

export enum ResourcesEvent {
  Ready = "resources:ready",
  LoadingProgress = "resources:loading-progress",
}

export interface Source {
  name: string;
  type: SourceType;
  path: string;
}

interface Loaders {
  texture: THREE.TextureLoader;
  gltfModel: GLTFLoader;
}

export default class Resources {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly loaders: Loaders;
  private _textures: Map<string, THREE.Texture> = new Map();
  private readonly eventsManager: EventsManager = eventsManager;

  constructor(sources: Source[]) {
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
      this.eventsManager.emit(ResourcesEvent.Ready);
    };
    this.loadingManager.onProgress = (_: string, loaded, total) => {
      const progress = loaded / total;
      this.eventsManager.emit(ResourcesEvent.LoadingProgress, progress);
    };
  }
}
