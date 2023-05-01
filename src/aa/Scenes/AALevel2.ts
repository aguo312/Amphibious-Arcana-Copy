import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel from "./AALevel";
import { AALayers } from "./AALevel";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";

import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Level1 from "./AALevel1";
import CheatsManager from "../CheatsManager";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import MindFlayerBehavior from "../AI/NPC/NPCBehaviors/MindFlayerBehavior";
import MindFlayerParticles from "../AI/NPC/MindFlayerParticles";
import Color from "../../Wolfie2D/Utils/Color";
import Level5 from "./AALevel5";

/**
 * The second level for HW4. It should be the goose dungeon / cave.
 */
export default class Level2 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(32, 64);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL2";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/boss_desert.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/lvl2_music.wav";

    public static readonly JUMP_AUDIO_KEY = "PLAYER_JUMP";
    public static readonly JUMP_AUDIO_PATH = "hw4_assets/sounds/jump.wav";

    public static readonly LEVEL_END = new AABB(new Vec2(224, 232), new Vec2(24, 16));

    protected bossSpawnTriggerPos: Vec2;
    protected bossSpawnTriggerHalfSize: Vec2;

    protected cheatsManager: CheatsManager;

    protected mindFlayerParticleSystem: MindFlayerParticles;

    public constructor(
        viewport: Viewport,
        sceneManager: SceneManager,
        renderingManager: RenderingManager,
        options: Record<string, any>
    ) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level2.TILEMAP_KEY;
        this.tilemapScale = Level2.TILEMAP_SCALE;
        this.collidableLayerKey = Level2.COLLIDABLE_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level1.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level2.PLAYER_SPAWN;

        // Music and sound
        this.levelMusicKey = Level2.LEVEL_MUSIC_KEY;
        this.jumpAudioKey = Level1.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level1.ATTACK_AUDIO_KEY;
        this.explodeAudioKey = Level1.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level1.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level1.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level1.PLAYER_DEATH_AUDIO_KEY;

        // Level end size and position
        // this.levelEndPosition = new Vec2(32, 216).mult(this.tilemapScale);
        // this.levelEndHalfSize = new Vec2(32, 32).mult(this.tilemapScale);

        this.bossSpawnTriggerPos = new Vec2(600, 0).mult(this.tilemapScale);
        this.bossSpawnTriggerHalfSize = new Vec2(10, 160).mult(this.tilemapScale);

        this.bossFightCenterPoint = new Vec2(650, 0).mult(this.tilemapScale);
        this.bossName = "Mind Flayer";

        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
        });
        this.currLevel = Level2;
    }
    /**
     * Load in resources for level 2.
     */
    public loadScene(): void {
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level2.TILEMAP_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Mind Flayer", "hw4_assets/spritesheets/mind_flayer.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level2.LEVEL_MUSIC_PATH);
        this.load.audio(this.jumpAudioKey, Level1.JUMP_AUDIO_PATH);
        this.load.audio(this.attackAudioKey, Level1.ATTACK_AUDIO_PATH);
        this.load.audio(this.explodeAudioKey, Level1.EXPLODE_AUDIO_PATH);
        this.load.audio(this.grappleAudioKey, Level1.GRAPPLE_AUDIO_PATH);
        this.load.audio(this.enemyDeathAudioKey, Level1.ENEMY_DEATH_AUDIO_PATH);
        this.load.audio(this.playerDeathAudioKey, Level1.PLAYER_DEATH_AUDIO_PATH);
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

        this.load.unloadAllResources();
    }

    protected initializeNPCs(): void {
        // initialize boss weapon system
        this.mindFlayerParticleSystem = new MindFlayerParticles(50, Vec2.ZERO, 1000, 3, 10, 50);
        this.mindFlayerParticleSystem.initializePool(this, AALayers.PRIMARY);

        const mindFlayer = this.add.animatedSprite("Mind Flayer", AALayers.PRIMARY);
        mindFlayer.scale.scale(0.25);
        mindFlayer.position.set(700, Level2.PLAYER_SPAWN.y).mult(this.tilemapScale);
        mindFlayer.addPhysics();
        mindFlayer.setGroup(AAPhysicsGroups.ENEMY);
        mindFlayer.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
        mindFlayer.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICE_HIT_BOSS, null);
        mindFlayer.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_BOSS, null);
        mindFlayer.health = 10;
        mindFlayer.maxHealth = 10;

        // const healthbar = new HealthbarHUD(this, mindFlayer, AALayers.UI, {
        //     size: mindFlayer.size.clone().scaled(1.0, 0.1),
        //     offset: mindFlayer.size.clone().scaled(0, -0.18),
        // });
        // healthbar.visible = false;
        // this.healthbars.set(mindFlayer.id, healthbar);

        mindFlayer.animation.play("IDLE");
        mindFlayer.addAI(MindFlayerBehavior, {
            player: this.player,
            particles: this.mindFlayerParticleSystem,
        });
        this.allNPCS.set(mindFlayer.id, mindFlayer);

        mindFlayer.tweens.add("DEATH", {
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
            onEnd: [AAEvents.NPC_KILLED, AAEvents.PLAYER_ENTERED_LEVEL_END],
        });
    }

    protected initializeTriggers(): void {
        const bossSpawnTrigger = <Rect>this.add.graphic(GraphicType.RECT, AALayers.PRIMARY, {
            position: this.bossSpawnTriggerPos,
            size: this.bossSpawnTriggerHalfSize,
        });
        bossSpawnTrigger.color = Color.TRANSPARENT;
        bossSpawnTrigger.addPhysics(undefined, undefined, false, true);
        bossSpawnTrigger.setTrigger(AAPhysicsGroups.PLAYER, AAEvents.SPAWN_BOSS, null);
    }

    public startScene(): void {
        super.startScene();
        this.nextLevel = Level5;
        this.nextLevelNum = 5;

        this.initializeNPCs();
        this.initializeTriggers();
    }

    public updateScene(deltaT: number) {
        super.updateScene(deltaT);
        this.cheatsManager.update(deltaT);
    }

    protected initializeViewport(): void {
        super.initializeViewport();
        this.viewport.setBounds(16, 16, 1600, 700);
    }
}
