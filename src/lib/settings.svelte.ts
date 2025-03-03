import ExampleImages from "./example-images";

export class Settings {
    autoDownload: boolean = $state(false);
    removeSolidColor: boolean = $state(true);
    removeBackgroundOnLoad: boolean = $state(true);
    singleColorThreshold: number = 0.05;
    lastExampleImage: number = 0;

    private cookieName = "settings";
    private daysCookieIsKept = 365;

    static _instance: Settings;

    private constructor() {
        this.setSettings();
        this.getSettings();
        //TODO: This is probably ugly?
        $effect(() => {
            this.stateUpdated([this.autoDownload, this.removeSolidColor, this.removeBackgroundOnLoad, this.singleColorThreshold, this.lastExampleImage])
        });
    }

    private stateUpdated(throwAwayObject: any) {
        if (this.lastExampleImage >= ExampleImages.instance.length) {
            this.lastExampleImage = 0;
        }
        this.setSettings();
    }

    public static get instance(): Settings {
        if (!Settings._instance) {
            Settings._instance = new Settings();
        }

        return Settings._instance;
    }

    getSettings() {
        const jsonString = this.getCookie();
        try {
            this.parseJSON(jsonString);
        } catch (e) {
            console.info(e);
        }
    }

    setSettings() {
        const json = JSON.stringify(this.getJSON());
        const d = new Date();
        d.setTime(d.getTime() + (this.daysCookieIsKept * 24 * 60 * 60 * 1000));
        let expires = "expires=" + d.toUTCString();
        document.cookie = this.cookieName + "=" + json + ";" + expires + ";path=/";
    }

    private parseJSON(jsonString: string) {
        const settings = JSON.parse(jsonString)
        this.autoDownload = settings.autoDownload ?? this.autoDownload;
        this.removeSolidColor = settings.removeSolidColor ?? this.removeSolidColor;
        this.removeBackgroundOnLoad = settings.removeBackgroundOnLoad ?? this.removeBackgroundOnLoad;
        this.singleColorThreshold = settings.singleColorThreshold ?? this.singleColorThreshold;
        this.lastExampleImage = settings.lastExampleImage ?? this.lastExampleImage;
    }

    private getJSON() {
        return {
            autoDownload: this.autoDownload,
            removeSolidColor: this.removeSolidColor,
            removeBackgroundOnLoad: this.removeBackgroundOnLoad,
            singleColorThreshold: this.singleColorThreshold,
            lastExampleImage: this.lastExampleImage,
        };
    }

    private getCookie() {
        let name = this.cookieName + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
}




