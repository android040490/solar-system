import eventsManager, { EventsManager } from "./Utils/EventsManager";
import { ResourcesEvent } from "./Utils/Resources";

export default class SplashScreen {
  private loadingBar: HTMLElement | null;
  private splashScreen: HTMLElement | null;
  private readonly eventsManager: EventsManager = eventsManager;

  constructor() {
    this.loadingBar = document.getElementById("loading-bar");
    this.splashScreen = document.getElementById("splash-screen");

    this.setListeners();
  }

  private setListeners(): void {
    this.eventsManager.on(ResourcesEvent.LoadingProgress, (progress) => {
      this.updateProgressBar(progress);
    });

    this.eventsManager.on(ResourcesEvent.Ready, () => {
      this.hide();
    });
  }

  private hide(): void {
    this.splashScreen?.classList.add("hidden");

    this.splashScreen?.addEventListener("transitionend", () => {
      if (this.splashScreen) {
        this.splashScreen.style.display = "none";
      }
    });

    setTimeout(() => {
      if (this.loadingBar) {
        this.loadingBar.classList.add("ended");
        this.loadingBar.style.transform = "";
      }
    }, 800);
  }

  private updateProgressBar(progress: number): void {
    if (this.loadingBar) {
      this.loadingBar.style.transform = `scaleX(${progress})`;
    }
    const progressTextElement = document.getElementById("progress-text");
    if (progressTextElement) {
      progressTextElement.innerText = `Loading ${progress * 100}%`;
    }
  }
}
