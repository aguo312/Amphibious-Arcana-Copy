import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import MainMenu from "./MainMenu";

// Layers for the main menu scene
export const MenuLayers = {
    MAIN: "MAIN"
} as const;

export default class SplashSceen extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu_concept.wav";
    protected gameLogo: Sprite;

    public loadScene(): void {
        // Load the menu song
        this.load.audio(SplashSceen.MUSIC_KEY, SplashSceen.MUSIC_PATH);
        this.load.image('Logo', 'hw4_assets/images/Logo.png');

    }

    public startScene(): void {
        this.addUILayer(MenuLayers.MAIN);

        // Center the viewport
        let size = this.viewport.getHalfSize();
        let yOffset = 80;
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        // Create title
        let prompt = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.MAIN, {
            position: new Vec2(size.x, size.y + 200), 
            text: "Click Anywhere to Start!"
        });

        // Create a play button
        let playBtn = this.createButton("Play Game", new Vec2(size.x, size.y));

        // When the play button is clicked, go to the next scene
        playBtn.onClick = () => {
            this.sceneManager.changeToScene(MainMenu);
        }

        // Add logo
        this.gameLogo = this.add.sprite("Logo", MenuLayers.MAIN);
        this.gameLogo.position.set(size.x, size.y - 100); // Set the position of the logo
        this.gameLogo.scale.set(.25,.25)


        // Scene has started, so start playing music
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: SplashSceen.MUSIC_KEY, loop: true, holdReference: true});
    }

    private createButton(text: String, pos: Vec2): Button {
        let size = this.viewport.getHalfSize()
    
        let btn = <Button>this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, {position: pos, text: text});
        btn.backgroundColor = Color.TRANSPARENT;
        btn.borderColor = Color.WHITE;
        btn.borderRadius = 0;
        btn.setPadding(new Vec2(size.x, size.y));
        btn.font = "PixelSimple";
        return btn;
    }

    public unloadScene(): void {
        // The scene is being destroyed, so we can stop playing the song
        this.load.keepAudio(SplashSceen.MUSIC_KEY)
        this.load.keepImage('Logo');
        //this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: SplashSceen.MUSIC_KEY});
    }
}

