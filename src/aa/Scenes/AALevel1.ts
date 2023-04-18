import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel, {AALayers} from "./AALevel";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import HW4Level2 from "./AALevel2";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import {UIElementType} from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Timer from "../../Wolfie2D/Timing/Timer";
import IdleBehavior from "../AI/NPC/NPCBehaviors/IdleBehavior";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import EnemyBehavior from "../AI/NPC/NPCBehaviors/EnemyBehavior";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level1 extends AALevel {

    public static readonly PLAYER_SPAWN = new Vec2(50, 480);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL1";
    //public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/HW4Level1.json";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/desert_level_1.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    //public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/hw5_level_music.wav";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/frog_lvl_1.wav";

    public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    public static readonly TILE_DESTROYED_KEY = "TILE_DESTROYED";
    public static readonly TILE_DESTROYED_PATH = "hw4_assets/sounds/switch.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(1400, 232), new Vec2(24, 16));
    protected tutorialText: Label;
    protected tutorialTextTimer: Timer;

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level1.TILEMAP_KEY;
        this.tilemapScale = Level1.TILEMAP_SCALE;
        this.collidableLayerKey = Level1.COLLIDABLE_LAYER_KEY;
        this.tongueCollidableLayerKey = Level1.TONGUE_COLLIDABLE_LAYER_KEY;
        this.wallsLayerKey = Level1.WALLS_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level1.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level1.PLAYER_SPAWN;
        // Set the key for the spells sprite

        // Music and sound
        this.levelMusicKey = Level1.LEVEL_MUSIC_KEY
        this.jumpAudioKey = Level1.JUMP_AUDIO_KEY;
        this.tileDestroyedAudioKey = Level1.TILE_DESTROYED_KEY;

        // Level end size and position
        //this.levelEndPosition = new Vec2(790, 15).mult(this.tilemapScale);
        this.levelEndPosition = new Vec2(790, 180).mult(this.tilemapScale);

        // made bigger for testing
        this.levelEndHalfSize = new Vec2(32, 300).mult(this.tilemapScale);

    }

    public initializeUI(): void {
       super.initializeUI();

       let size = this.viewport.getHalfSize();

        // add random tutorial text
        this.tutorialText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.UI, {position: new Vec2(size.x, 180), text: "Try shooting fire at your feet to jump!"});
        this.tutorialText.size = new Vec2(300, 25);
        // this.tutorialText.backgroundColor = Color.BLACK;
        // this.tutorialText.backgroundColor.a = 10;
        this.tutorialTextTimer = new Timer(10000, () => this.tutorialText.visible = false, false);
    }

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load the tongue shader
        super.loadScene();
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level1.TILEMAP_PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, Level1.PLAYER_SPRITE_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Scabbers", "hw4_assets/spritesheets/scabbers2.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level1.LEVEL_MUSIC_PATH);
        this.load.audio(this.jumpAudioKey, Level1.JUMP_AUDIO_PATH);
        this.load.audio(this.tileDestroyedAudioKey, Level1.TILE_DESTROYED_PATH);

        this.load.image('fireIcon', 'hw4_assets/sprites/fire-icon.png');
        this.load.image('tongueIcon', 'hw4_assets/sprites/tongue-icon.png');
        this.load.image('iceIcon', 'hw4_assets/sprites/ice-icon.png');
    }

    /**
     * Unload resources for level 1 - decide what to keep
     */
    public unloadScene(): void {
        this.load.keepSpritesheet(this.playerSpriteKey);
        this.load.keepAudio(this.levelMusicKey);
        this.load.keepAudio(this.jumpAudioKey);
        this.load.keepAudio(this.tileDestroyedAudioKey);

        this.load.keepImage('fireIcon')
        this.load.keepImage('tongueIcon')
        this.load.keepImage('iceIcon')

    }

    public startScene(): void {
        super.startScene();
        this.tutorialTextTimer.start();
        // Set the next level to be Level2
        this.nextLevel = HW4Level2;
        this.nextLevelNum = 2;

        this.initializeNPCs();
    }

    protected initializeNPCs(): void {
        let scabbers = this.add.animatedSprite("Scabbers", AALayers.PRIMARY);
        scabbers.scale.scale(0.25);
        scabbers.position.set(Level1.PLAYER_SPAWN.x, Level1.PLAYER_SPAWN.y);
        scabbers.addPhysics();
        scabbers.setGroup(AAPhysicsGroups.ENEMY);
        scabbers.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null)
        scabbers.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICEBALL_HIT_ENEMY, null)
        scabbers.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null)


        // scabbers.addPhysics(new AABB(Vec2.ZERO, scabbers.size.clone()), null, false);
        //scabbers.addAI(IdleBehavior);
        // scabbers.addAI(PaceBehavior);
        scabbers.animation.play("IDLE");
        this.allNPCS.set(scabbers.id, scabbers);

        // scabbers.addAI(IdleBehavior);
        scabbers.addAI(EnemyBehavior);
    }

    /**
     * I had to override this method to adjust the viewport for the first level. I screwed up 
     * when I was making the tilemap for the first level is what it boils down to.
     * 
     * - Peter
     */
    protected initializeViewport(): void {
        super.initializeViewport();
        this.viewport.setBounds(16, 16, 1600, 700);
    }

}