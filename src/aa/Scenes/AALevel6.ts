import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel, { AALayers } from "./AALevel";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Timer from "../../Wolfie2D/Timing/Timer";
import IdleBehavior from "../AI/NPC/NPCBehaviors/IdleBehavior";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import EnemyBehavior from "../AI/NPC/NPCBehaviors/EnemyBehavior";
import ScabberBehavior from "../AI/NPC/NPCBehaviors/ScabberBehavior";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import CheatsManager from "../CheatsManager";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level6 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(50, 630);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL1";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/AALevel5.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/frog_lvl_1.wav";

    public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump_alt.wav";

    public static readonly ATTACK_AUDIO_KEY = "PLAYER_ATTACK";
    public static readonly ATTACK_AUDIO_PATH = "hw4_assets/sounds/attack.wav";

    public static readonly EXPLODE_AUDIO_KEY = "EXPLODE";
    public static readonly EXPLODE_AUDIO_PATH = "hw4_assets/sounds/explode.wav";

    public static readonly GRAPPLE_AUDIO_KEY = "GRAPPLE";
    public static readonly GRAPPLE_AUDIO_PATH = "hw4_assets/sounds/grapple.wav";

    public static readonly ENEMY_DEATH_AUDIO_KEY = "ENEMY_DEATH";
    public static readonly ENEMY_DEATH_AUDIO_PATH = "hw4_assets/sounds/dying_quieter.wav";

    public static readonly PLAYER_DEATH_AUDIO_KEY = "PLAYER_DEATH";
    public static readonly PLAYER_DEATH_AUDIO_PATH = "hw4_assets/sounds/player_death.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(1400, 232), new Vec2(24, 16));
    protected tutorialText: Label;
    protected tutorialTextTimer: Timer;

    protected cheatsManager: CheatsManager;

    public constructor(
        viewport: Viewport,
        sceneManager: SceneManager,
        renderingManager: RenderingManager,
        options: Record<string, any>
    ) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level6.TILEMAP_KEY;
        this.tilemapScale = Level6.TILEMAP_SCALE;
        this.collidableLayerKey = Level6.COLLIDABLE_LAYER_KEY;
        this.tongueCollidableLayerKey = Level6.TONGUE_COLLIDABLE_LAYER_KEY;
        this.wallsLayerKey = Level6.WALLS_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level6.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level6.PLAYER_SPAWN;
        // Set the key for the spells sprite

        // Music and sound
        this.levelMusicKey = Level6.LEVEL_MUSIC_KEY;
        this.jumpAudioKey = Level6.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level6.ATTACK_AUDIO_KEY;
        this.explodeAudioKey = Level6.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level6.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level6.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level6.PLAYER_DEATH_AUDIO_KEY;

        // Level end size and position
        this.levelEndPosition = new Vec2(792, 24).mult(this.tilemapScale);

        // made bigger for testing
        this.levelEndHalfSize = new Vec2(16, 32).mult(this.tilemapScale);

        // Initialize cheats
        // Have to define and update cheatsManager in each individual level
        // to avoid circular dependencies
        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
        });
        this.currLevel = Level6;
    }

    public initializeUI(): void {
        super.initializeUI();

        let size = this.viewport.getHalfSize();

        // add random tutorial text
        this.tutorialText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.UI, {
            position: new Vec2(size.x, 180),
            text: "Try shooting ice to freeze enemies!\nClick again while its flying to create an ice platform.",
        });
        this.tutorialText.size = new Vec2(300, 25);
        // this.tutorialText.backgroundColor = Color.BLACK;
        // this.tutorialText.backgroundColor.a = 10;
        this.tutorialTextTimer = new Timer(10000, () => (this.tutorialText.visible = false), false);
    }

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load the tongue shader
        super.loadScene();
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level6.TILEMAP_PATH);
        // Load in the player's sprite
        this.load.spritesheet(this.playerSpriteKey, Level6.PLAYER_SPRITE_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Scabbers", "hw4_assets/spritesheets/scabbers2.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level6.LEVEL_MUSIC_PATH);
        this.load.audio(this.jumpAudioKey, Level6.JUMP_AUDIO_PATH);
        this.load.audio(this.attackAudioKey, Level6.ATTACK_AUDIO_PATH);
        this.load.audio(this.explodeAudioKey, Level6.EXPLODE_AUDIO_PATH);
        this.load.audio(this.grappleAudioKey, Level6.GRAPPLE_AUDIO_PATH);
        this.load.audio(this.enemyDeathAudioKey, Level6.ENEMY_DEATH_AUDIO_PATH);
        this.load.audio(this.playerDeathAudioKey, Level6.PLAYER_DEATH_AUDIO_PATH);

        this.load.image("fireIcon", "hw4_assets/sprites/fire-icon.png");
        this.load.image("tongueIcon", "hw4_assets/sprites/tongue-icon.png");
        this.load.image("iceIcon", "hw4_assets/sprites/ice-icon.png");
    }

    /**
     * Unload resources for level 1 - decide what to keep
     */
    public unloadScene(): void {
        this.load.keepSpritesheet(this.playerSpriteKey);

        this.load.keepAudio(this.levelMusicKey);
        this.load.keepAudio(this.jumpAudioKey);
        this.load.keepAudio(this.attackAudioKey);
        this.load.keepAudio(this.explodeAudioKey);
        this.load.keepAudio(this.grappleAudioKey);
        this.load.keepAudio(this.enemyDeathAudioKey);
        this.load.keepAudio(this.playerDeathAudioKey);

        this.load.keepImage("fireIcon");
        this.load.keepImage("tongueIcon");
        this.load.keepImage("iceIcon");
    }

    public startScene(): void {
        super.startScene();
        this.tutorialTextTimer.start();
        // Set the next level to be END
        // Return to main menu on completion
        this.nextLevel = MainMenu;
        this.nextLevelNum = 7;

        this.initializeNPCs();
    }

    protected initializeNPCs(): void {
        let locations = [
            new Vec2(136, 640),
            new Vec2(140, 64),
            new Vec2(184, 288),
            new Vec2(248, 384),
            new Vec2(329, 640),
            new Vec2(1047, 640),
            new Vec2(625, 640),
            new Vec2(1416, 640),
            new Vec2(1335, 368),
            new Vec2(1120, 368),
            new Vec2(712, 240),
            new Vec2(488, 288),
            new Vec2(860, 512),
            new Vec2(1090, 640),
            new Vec2(1442, 640),
            new Vec2(1556, 432),
            new Vec2(1556, 256),
        ];
        locations.forEach((l) => {
            let scabbers = this.add.animatedSprite("Scabbers", AALayers.PRIMARY);
            scabbers.scale.scale(0.25);
            scabbers.position.set(l.x, l.y);
            scabbers.addPhysics();
            scabbers.setGroup(AAPhysicsGroups.ENEMY);
            scabbers.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
            scabbers.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICEBALL_HIT_ENEMY, null);
            scabbers.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);

            scabbers.health = 3;
            scabbers.maxHealth = 3;
            let healthbar = new HealthbarHUD(this, scabbers, AALayers.PRIMARY, {
                size: scabbers.size.clone().scaled(1.5, 0.25),
                offset: scabbers.size.clone().scaled(0, -1 / 5),
            });
            this.healthbars.set(scabbers.id, healthbar);
            scabbers.animation.play("IDLE");
            scabbers.addAI(ScabberBehavior, { player: this.player });
            this.allNPCS.set(scabbers.id, scabbers);

            scabbers.tweens.add("DEATH", {
                startDelay: 0,
                duration: 500,
                effects: [
                    {
                        property: "rotation",
                        start: 0,
                        end: Math.PI,
                        ease: EaseFunctionType.IN_OUT_QUAD,
                    },
                    {
                        property: "alpha",
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.IN_OUT_QUAD,
                    },
                ],
                onEnd: [AAEvents.NPC_KILLED],
            });
        });
    }

    public updateScene(deltaT: number) {
        super.updateScene(deltaT);

        // Have to define and update cheatsManager in each individual level
        // to avoid circular dependencies
        this.cheatsManager.update(deltaT);
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
