import Input from "../Wolfie2D/Input/Input";
import SceneManager from "../Wolfie2D/Scene/SceneManager";
import { AAControls } from "./AAControls";
import Emitter from "../Wolfie2D/Events/Emitter";
import Level3 from "./Scenes/AALevel3";
import Level4 from "./Scenes/AALevel4";
import Level5 from "./Scenes/AALevel5";
import Level6 from "./Scenes/AALevel6";
import { AAEvents } from "./AAEvents";
import { GameEventType } from "../Wolfie2D/Events/GameEventType";
import ParticleSystemManager from "../Wolfie2D/Rendering/Animations/ParticleSystemManager";
import MainMenu from "./Scenes/MainMenu";
import Level1 from "./Scenes/AALevel1";
import Level2 from "./Scenes/AALevel2";
import Level0 from "./Scenes/AALevel0";

export default class CheatsManager {
    protected emitter: Emitter;
    protected sceneManager: SceneManager;
    protected options: Record<string, any>;

    constructor(sceneManager: SceneManager, options: Record<string, any>) {
        this.sceneManager = sceneManager;
        this.options = options;
        this.emitter = new Emitter();
    }

    public update(deltaT: number): void {
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_0)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 0;
            this.sceneManager.changeToScene(Level0);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_1)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 1;
            this.sceneManager.changeToScene(Level1);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_2)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 2;
            this.sceneManager.changeToScene(Level2);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_3)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 3;
            this.sceneManager.changeToScene(Level3);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_4)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 4;
            this.sceneManager.changeToScene(Level4);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_5)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 5;
            this.sceneManager.changeToScene(Level5);
        }
        if (Input.isJustPressed(AAControls.GOTO_LEVEL_6)) {
            ParticleSystemManager.getInstance().clearParticleSystems();
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: this.options.levelMusicKey });
            MainMenu.CURRENT_LEVEL = 6;
            this.sceneManager.changeToScene(Level6);
        }
        if (Input.isJustPressed(AAControls.GOTO_BOSS)) {
            this.emitter.fireEvent(AAEvents.GOTO_BOSS);
        }
        if (Input.isJustPressed(AAControls.TOGGLE_INVINCIBILITY)) {
            this.emitter.fireEvent(AAEvents.TOGGLE_INVINCIBILITY);
        }
        if (Input.isJustPressed(AAControls.PLAYER_KILL)) {
            this.emitter.fireEvent(AAEvents.KILL_PLAYER);
        }
        if (Input.isJustPressed(AAControls.UNLOCK_SPELLS)) {
            MainMenu.CURRENT_LEVEL = 6;
        }
    }
}
