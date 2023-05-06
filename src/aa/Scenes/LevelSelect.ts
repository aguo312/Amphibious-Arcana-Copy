import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Button from "../../Wolfie2D/Nodes/UIElements/Button";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Scene from "../../Wolfie2D/Scene/Scene";
import Color from "../../Wolfie2D/Utils/Color";
import Level3 from "./AALevel3";
import Level4 from "./AALevel4";
import Level5 from "./AALevel5";
import Level6 from "./AALevel6";
import MainMenu from "./MainMenu";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";

// Layers for the level select scene
export const MenuLayers = {
    MAIN: "MAIN",
} as const;

export default class LevelSelect extends Scene {
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
        const size = this.viewport.getHalfSize();
        const yOffset = 80;
        const leftColX = size.x - 110;
        const rightColX = size.x + 110;
        this.viewport.setFocus(size);
        this.viewport.setZoomLevel(1);

        // Add logo
        this.gameLogo = this.add.sprite("Logo", MenuLayers.MAIN);
        this.gameLogo.position.set(size.x, size.y - 100); // Set the position of the logo
        this.gameLogo.scale.set(0.25, 0.25);

        // Create a back button
        const backBtn = this.createButton("Back", new Vec2(size.x, 2 * size.y - 60));

        const yPos = size.y + 100;

        // Create the individual level buttons
        const level1Btn = this.createButton("Level 1", new Vec2(leftColX, yPos));
        const level2Btn =
            MainMenu.LEVEL_COUNTER >= 2
                ? this.createButton("Level 2", new Vec2(rightColX, yPos))
                : this.createButton("Locked", new Vec2(rightColX, yPos));

        const level3Btn =
            MainMenu.LEVEL_COUNTER >= 3
                ? this.createButton("Level 3", new Vec2(leftColX, yPos + yOffset))
                : this.createButton("Locked", new Vec2(leftColX, yPos + yOffset));
        const level4Btn =
            MainMenu.LEVEL_COUNTER >= 4
                ? this.createButton("Level 4", new Vec2(rightColX, yPos + yOffset))
                : this.createButton("Locked", new Vec2(rightColX, yPos + yOffset));

        const level5Btn =
            MainMenu.LEVEL_COUNTER >= 5
                ? this.createButton("Level 5", new Vec2(leftColX, yPos + yOffset * 2))
                : this.createButton("Locked", new Vec2(leftColX, yPos + yOffset * 2));
        const level6Btn =
            MainMenu.LEVEL_COUNTER >= 6
                ? this.createButton("Level 6", new Vec2(rightColX, yPos + yOffset * 2))
                : this.createButton("Locked", new Vec2(rightColX, yPos + yOffset * 2));

        // When the play button is clicked, go to the next scene
        backBtn.onClick = () => {
            this.sceneManager.changeToScene(MainMenu);
        };

        level1Btn.onClick = () => {
            // TODO
            MainMenu.GAME_PLAYING = true;
            MainMenu.CURRENT_LEVEL = 1;
            this.sceneManager.changeToScene(Level3);
        };

        level2Btn.onClick = () => {
            // TODO
            if (MainMenu.LEVEL_COUNTER >= 2) {
                MainMenu.GAME_PLAYING = true;
                MainMenu.CURRENT_LEVEL = 2;
                this.sceneManager.changeToScene(Level4);
            }
        };

        level3Btn.onClick = () => {
            // TODO
            if (MainMenu.LEVEL_COUNTER >= 3) {
                MainMenu.CURRENT_LEVEL = 3;
                MainMenu.GAME_PLAYING = true;
                this.sceneManager.changeToScene(Level3);
            }
        };

        level4Btn.onClick = () => {
            // TODO
            if (MainMenu.LEVEL_COUNTER >= 4) {
                MainMenu.CURRENT_LEVEL = 4;
                MainMenu.GAME_PLAYING = true;
                this.sceneManager.changeToScene(Level4);
            }
        };

        level5Btn.onClick = () => {
            // TODO
            if (MainMenu.LEVEL_COUNTER >= 5) {
                MainMenu.CURRENT_LEVEL = 5;
                MainMenu.GAME_PLAYING = true;
                this.sceneManager.changeToScene(Level5);
            }
        };

        level6Btn.onClick = () => {
            // TODO
            if (MainMenu.LEVEL_COUNTER >= 6) {
                MainMenu.CURRENT_LEVEL = 6;
                MainMenu.GAME_PLAYING = true;
                this.sceneManager.changeToScene(Level6);
            }
        };

        // Scene has started, so start playing music
        // this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: LevelSelect.MUSIC_KEY, loop: true, holdReference: true});
    }

    private createButton(text: string, pos: Vec2): Button {
        const btn = <Button>(
            this.add.uiElement(UIElementType.BUTTON, MenuLayers.MAIN, { position: pos, text: text })
        );
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
        if (MainMenu.GAME_PLAYING) {
            this.emitter.fireEvent(GameEventType.STOP_SOUND, { key: LevelSelect.MUSIC_KEY });
        }
    }
}
