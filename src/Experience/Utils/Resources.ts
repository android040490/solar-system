import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import EventEmitter from "eventemitter3";

type SourceType = "texture" | "gltfModel";

export interface Source {
  name: string;
  type: SourceType;
  path: string;
}

type ResourceFile = GLTF | THREE.Texture;

type ResourceItems = Record<string, ResourceFile>;

export default class Resources extends EventEmitter {
  private readonly loaders = {
    gltfLoader: new GLTFLoader(),
    textureLoader: new THREE.TextureLoader(),
    // cubeTextureLoader: new THREE.CubeTextureLoader(),
  };
  private sources: Source[];
  private items: ResourceItems = {};
  private toLoad: number;
  private loaded = 0;

  constructor(sources: Source[]) {
    super();

    this.sources = sources;
    this.toLoad = this.sources.length;

    this.startLoading();
  }

  private startLoading(): void {
    for (const source of this.sources) {
      if (source.type === "gltfModel") {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      } else if (source.type === "texture") {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file);
        });
      }
      //  else if (source.type === "cubeTexture") {
      //   this.loaders.cubeTextureLoader.load(source.path, (file) => {
      //     this.sourceLoaded(source, file);
      //   });
      // }
    }
  }

  private sourceLoaded(source: Source, file: ResourceFile): void {
    this.items[source.name] = file;
    this.loaded++;
    if (this.loaded === this.toLoad) {
      this.emit("ready");
    }
  }
}
