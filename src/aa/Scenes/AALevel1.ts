import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel, { AALayers } from "./AALevel";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Level2 from "./AALevel2";
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
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AntBehavior from "../AI/NPC/NPCBehaviors/AntBehavior";
import Level0 from "./AALevel0";

export default class Level1 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(50, 935);
    // public static readonly PLAYER_SaPAWN = new Vec2(500, 500);

    // public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    // public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL1";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/TreeLevel.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/frog_lvl_1.wav";

    // public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    // public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump_alt.wav";

    // public static readonly ATTACK_AUDIO_KEY = "PLAYER_ATTACK";
    // public static readonly ATTACK_AUDIO_PATH = "hw4_assets/sounds/attack.wav";

    // public static readonly HEAL_AUDIO_KEY = "PLAYER_REGEN";
    // public static readonly HEAL_AUDIO_PATH = "hw4_assets/sounds/switch.wav";

    // public static readonly EXPLODE_AUDIO_KEY = "EXPLODE";
    // public static readonly EXPLODE_AUDIO_PATH = "hw4_assets/sounds/explode.wav";

    // public static readonly GRAPPLE_AUDIO_KEY = "GRAPPLE";
    // public static readonly GRAPPLE_AUDIO_PATH = "hw4_assets/sounds/grapple.wav";

    // public static readonly ENEMY_DEATH_AUDIO_KEY = "ENEMY_DEATH";
    // public static readonly ENEMY_DEATH_AUDIO_PATH = "hw4_assets/sounds/dying_quieter.wav";

    // public static readonly PLAYER_DEATH_AUDIO_KEY = "PLAYER_DEATH";
    // public static readonly PLAYER_DEATH_AUDIO_PATH = "hw4_assets/sounds/player_death.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(1400, 232), new Vec2(24, 16));
    protected tutorialText: Label;
    protected tutorialTextTimer: Timer;

    protected cheatsManager: CheatsManager;

    protected enemyPositions: Array<Vec2>;

    public constructor(
        viewport: Viewport,
        sceneManager: SceneManager,
        renderingManager: RenderingManager,
        options: Record<string, any>
    ) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level1.TILEMAP_KEY;
        this.tilemapScale = Level1.TILEMAP_SCALE;
        this.collidableLayerKey = Level1.COLLIDABLE_LAYER_KEY;
        this.tongueCollidableLayerKey = Level1.TONGUE_COLLIDABLE_LAYER_KEY;
        this.wallsLayerKey = Level1.WALLS_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level0.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level1.PLAYER_SPAWN;
        // Set the key for the spells sprite

        // Music and sound
        this.levelMusicKey = Level1.LEVEL_MUSIC_KEY;
        this.jumpAudioKey = Level0.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level0.ATTACK_AUDIO_KEY;
        this.healAudioKey = Level0.HEAL_AUDIO_KEY;
        this.hurtAudioKey = Level0.HURT_AUDIO_KEY;
        this.explodeAudioKey = Level0.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level0.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level0.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level0.PLAYER_DEATH_AUDIO_KEY;

        // Level end size and position
        //this.levelEndPosition = new Vec2(790, 15).mult(this.tilemapScale);
        this.levelEndPosition = new Vec2(2050, 350);

        // made bigger for testing
        this.levelEndHalfSize = new Vec2(32, 30).mult(this.tilemapScale);

        // Initialize cheats
        // Have to define and update cheatsManager in each individual level
        // to avoid circular dependencies
        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
        });

        this.currLevel = Level1;
    }

    public initializeUI(): void {
        super.initializeUI();

        let size = this.viewport.getHalfSize();

        // // Guide Textbox
        // this.guideText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.GUIDE, { position: new Vec2(this.playerSpawn.x + 90, this.playerSpawn.y - 50), text: "I HAVE SO MUCH TO SAY TO YOU" });
        // this.guideText.size.set(550, 180);
        // this.guideText.borderRadius = 25;
        // this.guideText.backgroundColor = new Color(34, 32, 52, 0);
        // this.guideText.textColor = Color.WHITE;
        // this.guideText.textColor.a = 0;
        // this.guideText.fontSize = 24;
        // this.guideText.font = "MyFont";

        this.guideText.position = new Vec2(this.playerSpawn.x + 90, this.playerSpawn.y - 50);

        // add random tutorial text
        this.tutorialText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.UI, {
            position: new Vec2(size.x, 180),
            text: "Try shooting fire at your feet to jump!",
        });
        this.tutorialText.size = new Vec2(300, 25);
        // this.tutorialText.backgroundColor = Color.BLACK;
        // this.tutorialText.backgroundColor.a = 10;
        this.tutorialTextTimer = new Timer(10000, () => (this.tutorialText.visible = false), false);
    }

    public initializeTutorialBox() {
        let size = this.viewport.getHalfSize();

        let tutorialBox = <Rect>this.add.graphic(GraphicType.RECT, AALayers.GUIDE, {
            position: new Vec2(size.x, size.y),
            size: new Vec2(100, 100),
        });
        tutorialBox.color = new Color(34, 32, 52, 0);
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
        // this.load.spritesheet(this.playerSpriteKey, Level1.PLAYER_SPRITE_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Scabbers", "hw4_assets/spritesheets/scabbers2.json");

        // Load in the guide sprite
        this.load.spritesheet("Guide", "hw4_assets/spritesheets/traveler.json");

        // Load in ant sprite
        this.load.spritesheet("Ant", "hw4_assets/spritesheets/fire_ant.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level1.LEVEL_MUSIC_PATH);
        // this.load.audio(this.jumpAudioKey, Level1.JUMP_AUDIO_PATH);
        // this.load.audio(this.attackAudioKey, Level1.ATTACK_AUDIO_PATH);
        // this.load.audio(this.healAudioKey, Level1.HEAL_AUDIO_PATH);
        // this.load.audio(this.explodeAudioKey, Level1.EXPLODE_AUDIO_PATH);
        // this.load.audio(this.grappleAudioKey, Level1.GRAPPLE_AUDIO_PATH);
        // this.load.audio(this.enemyDeathAudioKey, Level1.ENEMY_DEATH_AUDIO_PATH);
        // this.load.audio(this.playerDeathAudioKey, Level1.PLAYER_DEATH_AUDIO_PATH);

        // this.load.image("fireIcon", "hw4_assets/sprites/fire-icon.png");
        // this.load.image("tongueIcon", "hw4_assets/sprites/tongue-icon.png");
        // this.load.image("iceIcon", "hw4_assets/sprites/ice-icon.png");
        // this.load.image("lockIcon", "hw4_assets/sprites/lock-icon.png");
    }

    /**
     * Unload resources for level 1 - decide what to keep
     */
    public unloadScene(): void {
        this.load.keepSpritesheet(this.playerSpriteKey);

        // this.load.keepAudio(this.levelMusicKey);
        this.load.keepAudio(this.jumpAudioKey);
        this.load.keepAudio(this.attackAudioKey);
        this.load.keepAudio(this.healAudioKey);
        this.load.keepAudio(this.hurtAudioKey);
        this.load.keepAudio(this.explodeAudioKey);
        this.load.keepAudio(this.grappleAudioKey);
        this.load.keepAudio(this.enemyDeathAudioKey);
        this.load.keepAudio(this.playerDeathAudioKey);

        this.load.keepImage("fireIcon");
        this.load.keepImage("tongueIcon");
        this.load.keepImage("iceIcon");
        this.load.keepImage("lockIcon");
    }

    public startScene(): void {
        super.startScene();
        this.tutorialTextTimer.start();
        this.guideText.tweens.play("fadeIn");

        // Set the next level to be Level2
        this.nextLevel = Level2;
        this.nextLevelNum = 2;

        this.initializeNPCs();
    }

    protected initializeNPCs(): void {
        // this.enemyPositions = [
        //     new Vec2(200, 600),
        //     new Vec2(500, 600),
        //     new Vec2(800, 600),
        //     new Vec2(1150, 400),
        // ];
        // for (let pos of this.enemyPositions) {
        //     let scabbers = this.add.animatedSprite("Scabbers", AALayers.PRIMARY);
        //     scabbers.scale.scale(0.25);
        //     scabbers.position.set(pos.x, pos.y);
        //     scabbers.addPhysics();
        //     scabbers.setGroup(AAPhysicsGroups.ENEMY);
        //     scabbers.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
        //     scabbers.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICEBALL_HIT_ENEMY, null);
        //     scabbers.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);
        //     scabbers.health = 3;
        //     scabbers.maxHealth = 3;
        //     let healthbar = new HealthbarHUD(this, scabbers, AALayers.PRIMARY, {
        //         size: scabbers.size.clone().scaled(1.5, 0.25),
        //         offset: scabbers.size.clone().scaled(0, -1 / 5),
        //     });
        //     this.healthbars.set(scabbers.id, healthbar);
        //     scabbers.animation.play("IDLE");
        //     scabbers.addAI(ScabberBehavior, { player: this.player });
        //     this.allNPCS.set(scabbers.id, scabbers);
        //     scabbers.tweens.add("DEATH", {
        //         startDelay: 0,
        //         duration: 500,
        //         effects: [
        //             {
        //                 property: "rotation",
        //                 start: 0,
        //                 end: Math.PI,
        //                 ease: EaseFunctionType.IN_OUT_QUAD,
        //             },
        //             {
        //                 property: "alpha",
        //                 start: 1,
        //                 end: 0,
        //                 ease: EaseFunctionType.IN_OUT_QUAD,
        //             },
        //         ],
        //         onEnd: [AAEvents.NPC_KILLED],
        //     });
        // }
        // let guide = this.add.animatedSprite("Guide", AALayers.GUIDE);
        // guide.scale.scale(0.3);
        // guide.position.set(this.playerSpawn.x + 90, this.playerSpawn.y - 3);
        // guide.addPhysics(null, null, false);
        // guide.setGroup(AAPhysicsGroups.TUTORIAL);
        // guide.setTrigger(AAPhysicsGroups.PLAYER, "GUIDE", null);
        // guide.animation.play("IDLE");
        // this.allNPCS.set(guide.id, guide);
        // let ant = this.add.animatedSprite("Ant", AALayers.GUIDE);
        // ant.scale.scale(.25)
        // ant.position.set(this.playerSpawn.x, this.playerSpawn.y - 100)
        // ant.addPhysics(null, null, false)
        // ant.setGroup(AAPhysicsGroups.ENEMY)
        // ant.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);
        // ant.animation.play("IDLE");
        // ant.addAI(AntBehavior, { player: this.player });
        // ant.health = 3;
        // ant.maxHealth = 3;
        // let healthbar = new HealthbarHUD(this, ant, AALayers.PRIMARY, {
        //     size: ant.size.clone().scaled(1.5, 0.125),
        //     offset: ant.size.clone().scaled(0, -1 / 5),
        // });
        // this.healthbars.set(ant.id, healthbar);
        // this.allNPCS.set(ant.id, ant);
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
        this.viewport.setBounds(16, 16, 2065, 1600);
    }
}
