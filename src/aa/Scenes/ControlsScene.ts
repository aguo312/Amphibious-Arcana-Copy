import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";


// Layers for the controls scene
export const MenuLayers = {
    MAIN: "MAIN"
} as const;

export default class ControlsScene extends Scene {

    public static readonly MUSIC_KEY = "MAIN_MENU_MUSIC";
    public static readonly MUSIC_PATH = "hw4_assets/music/menu.mp3";
    protected gameLogo: Sprite;

    public loadScene(): void {
        // Load the menu song
        // TODO keep audio from main menu
        //this.load.audio(LevelSelect.MUSIC_KEY, LevelSelect.MUSIC_PATH);
    }

    public startScene(): void {
        this.addUILayer(MenuLayers.MAIN);

        // Center the viewport
        let size = this.viewport.getHalfSize();
        let yOffset = 30;
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        // Add logo
        this.gameLogo = this.add.sprite("Logo", MenuLayers.MAIN);
        this.gameLogo.position.set(size.x, size.y - 180); // Set the position of the logo
        this.gameLogo.scale.set(.25,.25)
        // Create title
        // const title = <Label>this.add.uiElement(UIElementType.LABEL, MenuLayers.MAIN, {
        //     position: new Vec2(size.x, size.y - 120),
        //     text: "Amphibious Arcana"
        // });

        // Create controls text
        let i = 1;
        this.createLabel("W - Jump", new Vec2(size.x, size.y));
        this.createLabel("A - Walk Left", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("D - Walk Right", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("1 - Select Spell 1", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("2 - Select Spell 2", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("3 - Select Spell 3", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("Left Click - Cast Spell", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("Mouse - Aim Spell", new Vec2(size.x, size.y + yOffset*i++));
        this.createLabel("ESC - Pause Game", new Vec2(size.x, size.y + yOffset*i++));


        // Create a back button
        const backBtn = this.createButton("Back", new Vec2(size.x, 2*size.y - 60));

        // When the play button is clicked, go to the next scene
        backBtn.onClick = () => {
            this.sceneManager.changeToScene(MainMenu);
        }

        // Scene has started, so start playing music
        // this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: ControlsScene.MUSIC_KEY, loop: true, holdReference: true});
    }

    private createLabel(text: String, pos: Vec2): void {
        this.add.uiElement(UIElementType.LABEL, MenuLayers.MAIN, {
            position: pos,
            text: text,
            fontSize: 24
        });
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
        // TODO probably only destroy this on level select, and not when going back to main menu
        // this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: ControlsScene.MUSIC_KEY});
    }
}

