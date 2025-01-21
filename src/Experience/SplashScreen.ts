import Experience from "./Experience";
import Resources from "./Utils/Resources";

export default class SplashScreen {
  private resources: Resources;
  private loadingBar: HTMLElement | null;
  private splashScreen: HTMLElement | null;

  constructor() {
    const experience = new Experience();
    this.resources = experience.resources;
    this.loadingBar = document.getElementById("loading-bar");
    this.splashScreen = document.getElementById("splash-screen");

    this.setListeners();
  }

  private setListeners(): void {
    this.resources.on("progress", (progress) => {
      this.updateProgressBar(progress);
    });

    this.resources.on("ready", () => {
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
