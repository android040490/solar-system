import * as THREE from "three";
import Experience from "../../core/Experience";
import eventsManager, { EventsManager } from "../../core/Utils/EventsManager";
import { ResourcesEvent } from "../../core/Utils/Resources";
import { TimeEvent } from "../../core/Utils/Time";
import Camera from "../../core/Camera";
import Sizes from "../../core/Utils/Sizes";
import classes from "./style.module.css";

// function throttle<T extends (...args: any[]) => void>(
//   func: T,
//   delay: number,
// ): T {
//   let lastCall = 0;
//   return function (this: unknown, ...args: Parameters<T>) {
//     const now = Date.now();
//     if (now - lastCall >= delay) {
//       lastCall = now;
//       func.apply(this, args);
//     }
//   } as T;
// }

interface Marker {
  sourceObject: {
    position: THREE.Vector3;
    radius: number;
  };
  element: HTMLElement;
}

export class SpaceObjectMarkers extends HTMLElement {
  static selector = "space-object-markers";

  private readonly experience: Experience;
  private readonly camera: Camera;
  private readonly sizes: Sizes;
  private readonly raycaster: THREE.Raycaster;
  private readonly eventsManager: EventsManager;
  private markers: Marker[] = [];
  private rendered = false;

  constructor() {
    super();

    this.experience = new Experience();
    this.camera = this.experience.camera;
    this.sizes = this.experience.sizes;
    this.raycaster = new THREE.Raycaster();
    this.eventsManager = eventsManager;

    this.setListeners();
    // this.update = throttle(this.update, 10); // TODO: maybe wrap update method in a throttle function for better performance if needed
  }

  private setListeners(): void {
    this.eventsManager.on(ResourcesEvent.Ready, () => {
      if (!this.rendered) {
        this.render();
        this.rendered = true;
      }
    });

    this.eventsManager.on(TimeEvent.Tick, () => {
      if (this.rendered) {
        this.update();
      }
    });
  }

  private render(): void {
    const { navigableObjects } = this.experience.navigation;

    for (const object of navigableObjects) {
      const marker = document.createElement("div");
      marker.classList.add(classes.marker, classes.clicable);
      marker.innerHTML = `
        <div class="${classes.clicableArea}"></div>
        <div class="${classes.icon}" style="border-color: ${object.markerColor};"></div>
        <div class="${classes.text}">${object.name}</div>
      `;
      marker.addEventListener("click", () => {
        this.experience.navigation.navigateTo(object);
      });
      this.appendChild(marker);

      this.markers.push({
        sourceObject: object,
        element: marker,
      });
    }
  }

  private update(): void {
    for (const marker of this.markers) {
      const { element, sourceObject } = marker;
      const screenPosition = sourceObject.position.clone();

      screenPosition.project(this.camera.instance);

      if (
        Math.abs(screenPosition.x) > 1 ||
        Math.abs(screenPosition.y) > 1 ||
        Math.abs(screenPosition.z) > 1
      ) {
        element.classList.remove(classes.visible, classes.clicable);
        continue;
      }

      const translateX = screenPosition.x * this.sizes.width * 0.5;
      const translateY = -screenPosition.y * this.sizes.height * 0.5;
      element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;

      const distanceToObject = sourceObject.position.distanceTo(
        this.camera.instance.position,
      );

      this.raycaster.setFromCamera(
        new THREE.Vector2(screenPosition.x, screenPosition.y),
        this.camera.instance,
      );
      const intersections = this.raycaster.intersectObjects(
        this.experience.scene.children,
        true,
      );

      const isShortDistance = distanceToObject / sourceObject.radius < 100;
      const isIntersected =
        intersections.length &&
        intersections[0].distance < distanceToObject - sourceObject.radius;

      element.classList.toggle(
        classes.visible,
        !isIntersected && !isShortDistance,
      );
      element.classList.toggle(classes.clicable, !isIntersected);
    }
  }
}
