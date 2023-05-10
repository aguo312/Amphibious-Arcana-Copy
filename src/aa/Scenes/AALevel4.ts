import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel from "./AALevel";
import { AALayers } from "./AALevel";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";

import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Level3 from "./AALevel3";
import CheatsManager from "../CheatsManager";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import Boss2Behavior from "../AI/NPC/NPCBehaviors/Boss2Behavior";
import Level0 from "./AALevel0";
import Color from "../../Wolfie2D/Utils/Color";
import Level5 from "./AALevel5";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import XvartBehavior from "../AI/NPC/NPCBehaviors/XvartBehavior";

/**
 * The second level for HW4. It should be the goose dungeon / cave.
 */
export default class Level4 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(32, 1750);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly BOSS_SPAWN = new Vec2(1500, 670);

    public static readonly TILEMAP_KEY = "LEVEL2";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/boss_desert_new.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/lvl2_music.wav";

    public static readonly BOSS_MUSIC_KEY = "BOSS_MUSIC";
    public static readonly BOSS_MUSIC_PATH = "hw4_assets/music/lvl2_music.wav";

    protected bossSpawnTriggerPos: Vec2;
    protected bossSpawnTriggerHalfSize: Vec2;

    protected cheatsManager: CheatsManager;

    public constructor(
        viewport: Viewport,
        sceneManager: SceneManager,
        renderingManager: RenderingManager,
        options: Record<string, any>
    ) {
        super(viewport, sceneManager, renderingManager, options);

        // Set the keys for the different layers of the tilemap
        this.tilemapKey = Level4.TILEMAP_KEY;
        this.tilemapScale = Level4.TILEMAP_SCALE;
        this.collidableLayerKey = Level4.COLLIDABLE_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level0.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level4.PLAYER_SPAWN;

        // Music and sound
        this.levelMusicKey = Level4.LEVEL_MUSIC_KEY;
        this.jumpAudioKey = Level0.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level0.ATTACK_AUDIO_KEY;
        this.healAudioKey = Level0.HEAL_AUDIO_KEY;
        this.hurtAudioKey = Level0.HURT_AUDIO_KEY;
        this.explodeAudioKey = Level0.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level0.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level0.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level0.PLAYER_DEATH_AUDIO_KEY;
        this.backgroundKey = Level3.BACKGROUND_KEY;

        this.bossSpawnTriggerPos = new Vec2(1321, 660);
        this.bossSpawnTriggerHalfSize = new Vec2(10, 160).mult(this.tilemapScale);

        this.bossFightCenterPoint = new Vec2(1433, 620);
        this.bossName = "Traveler";

        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
            bossMusicKey: this.bossMusicKey,
        });
        this.currLevel = Level4;

        // Setup bg stuff
        this.bgScale = new Vec2(6.0, 6.2);
        this.bgOffset = new Vec2(100, 125).mult(this.tilemapScale);
        this.bgMovementScale = 0.7;
        this.bgMovementScaleY = 1.1;
    }
    /**
     * Load in resources for level 2.
     */
    public loadScene(): void {
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level4.TILEMAP_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Traveler", "hw4_assets/spritesheets/traveler.json");
        this.load.spritesheet("Xvart", "hw4_assets/spritesheets/xvart.json");

        // Load background image
        this.load.image(this.backgroundKey, Level3.BACKGROUND_PATH);

        // Audio and music
        this.load.audio(this.levelMusicKey, Level4.LEVEL_MUSIC_PATH);
        this.load.audio(this.bossMusicKey, Level4.BOSS_MUSIC_PATH);
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

    protected initializeNPCs(): void {
        // level boss
        const traveler = this.add.animatedSprite("Traveler", AALayers.PRIMARY);
        traveler.scale.scale(0.25);
        traveler.position.set(Level4.BOSS_SPAWN.x, Level4.BOSS_SPAWN.y);
        traveler.addPhysics(undefined, undefined, false, false);
        traveler.setGroup(AAPhysicsGroups.ENEMY);
        traveler.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
        traveler.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICE_HIT_BOSS, null);
        traveler.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_BOSS, null);
        traveler.health = 10;
        traveler.maxHealth = 10;

        traveler.addAI(Boss2Behavior, { player: this.player });
        this.allNPCS.set(traveler.id, traveler);

        traveler.tweens.add("DEATH", {
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

        const locations = [new Vec2(320, 1632), new Vec2(640, 1312), new Vec2(960, 991)];
        locations.forEach((l) => {
            const xvart = this.add.animatedSprite("Xvart", AALayers.PRIMARY);
            xvart.scale.scale(0.25);
            xvart.position.set(l.x, l.y);
            xvart.addPhysics();
            xvart.setGroup(AAPhysicsGroups.ENEMY);
            xvart.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
            xvart.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICEBALL_HIT_ENEMY, null);
            xvart.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);

            xvart.health = 3;
            xvart.maxHealth = 3;
            const healthbar = new HealthbarHUD(this, xvart, AALayers.PRIMARY, {
                size: xvart.size.clone().scaled(1.2, 0.15),
                offset: xvart.size.clone().scaled(0, -1 / 5),
            });
            this.healthbars.set(xvart.id, healthbar);
            xvart.animation.play("IDLE");
            xvart.addAI(XvartBehavior, { player: this.player, tilemap: "Collidable" }); // add particles here
            this.allNPCS.set(xvart.id, xvart);

            xvart.tweens.add("DEATH", {
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

    protected initializeTriggers(): void {
        this.bossSpawnTrigger = <Rect>this.add.graphic(GraphicType.RECT, AALayers.PRIMARY, {
            position: this.bossSpawnTriggerPos,
            size: this.bossSpawnTriggerHalfSize,
        });
        this.bossSpawnTrigger.color = Color.TRANSPARENT;
        this.bossSpawnTrigger.addPhysics(undefined, undefined, false, true);
        this.bossSpawnTrigger.setTrigger(AAPhysicsGroups.PLAYER, AAEvents.SPAWN_BOSS, null);
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
        this.viewport.setBounds(16, 16, 1584, 2600);
    }
}
