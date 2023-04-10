import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Level1 from "./HW3Level1";
import LevelSelect from "./LevelSelect";
import ControlsScene from "./ControlsScene";
import HelpScene from "./HelpScene";


// Layers for the main menu scene
export const MenuLayers = {
    MAIN: "MAIN"
} as const;

export default class MainMenu extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu_concept.wav";
    public static levelCounter = 1;

    public loadScene(): void {
        // Load the menu song
        //this.load.audio(MainMenu.MUSIC_KEY, MainMenu.MUSIC_PATH);
    }

    public startScene(): void {
        this.addUILayer(MenuLayers.MAIN);

        // Center the viewport
        let size = this.viewport.getHalfSize();
        let yOffset = 80;
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        // Create title
        let title = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.MAIN, {
            position: new Vec2(size.x, size.y - 120), 
            text: "Amphibious Arcana"
        });

        // Create a play button
        let playBtn = this.createButton("Play Game", new Vec2(size.x, size.y));

        // Create level select button
        let levelSelectBtn = this.createButton("Level Select", new Vec2(size.x, size.y + yOffset));

        // Create controls button
        let controlsBtn = this.createButton("Controls", new Vec2(size.x, size.y + yOffset*2));

        // Create help button
        let helpBtn = this.createButton("Help", new Vec2(size.x, size.y + yOffset*3));

        // When the play button is clicked, go to the next scene
        playBtn.onClick = () => {
            this.sceneManager.changeToScene(Level1);
        }

        levelSelectBtn.onClick = () => {
            this.sceneManager.changeToScene(LevelSelect);
        }

        controlsBtn.onClick = () => {
            this.sceneManager.changeToScene(ControlsScene);
        }

        helpBtn.onClick = () => {
            this.sceneManager.changeToScene(HelpScene);
        }

        // Scene has started, so start playing music
        //this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: MainMenu.MUSIC_KEY, loop: true, holdReference: true});
    }

    private createButton(text: String, pos: Vec2): Button {
        let btn = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, {position: pos, text: text});
        btn.backgroundColor = Color.TRANSPARENT;
        btn.borderColor = Color.WHITE;
        btn.borderRadius = 0;
        btn.setPadding(new Vec2(50, 10));
        btn.font = "PixelSimple";
        return btn;
    }

    public unloadScene(): void {
        // The scene is being destroyed, so we can stop playing the song
        this.load.keepAudio(MainMenu.MUSIC_KEY)
        this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: MainMenu.MUSIC_KEY});
    }
}

