import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import EventEmitter from "eventemitter3";

type SourceType = "texture" | "gltfModel";

export interface Source {
  name: string;
  type: SourceType;
  path: string;
}

export default class Resources extends EventEmitter {
  private readonly loaders = {
    gltfLoader: new GLTFLoader(),
    textureLoader: new THREE.TextureLoader(),
    // cubeTextureLoader: new THREE.CubeTextureLoader(),
  };
  private _textures: Map<string, THREE.Texture> = new Map();
  private toLoad: number;
  private loaded = 0;

  constructor(sources: Source[]) {
    super();

    this.toLoad = sources.length;

    this.startLoading(sources);
  }

  get textures(): Map<string, THREE.Texture> {
    return this._textures;
  }

  private startLoading(sources: Source[]): void {
    for (const source of sources) {
      if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.textureLoaded(source, file);
        });
      }
      // else if (source.type === "gltfModel") {
      //   this.loaders.gltfLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // }
      //  else if (source.type === "cubeTexture") {
      //   this.loaders.cubeTextureLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // }
    }
  }

  private textureLoaded(source: Source, file: THREE.Texture): void {
    this._textures.set(source.name, file);
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.emit("ready");
    }
  }
}
