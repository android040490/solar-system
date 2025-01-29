import { Root } from "./Root";
import { SplashScreen } from "./SplashScreen";
import { ProgressBar } from "./ProgressBar";
import { SpaceObjectMarkers } from "./SpaceObjectMarkers";

const components = [Root, SplashScreen, ProgressBar, SpaceObjectMarkers];

components.forEach((component) => {
  customElements.define(component.selector, component);
});
