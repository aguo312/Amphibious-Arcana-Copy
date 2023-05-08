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
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AntBehavior from "../AI/NPC/NPCBehaviors/AntBehavior";
import Level3 from "./AALevel3";
import AntParticles from "../AI/NPC/AntParticles";
import AntQueenBehavior from "../AI/NPC/NPCBehaviors/AntQueenBehavior";

import Level0 from "./AALevel0";

export default class Level2 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(50, 1100);
    // public static readonly PLAYER_SPAWN = new Vec2(1000, 1104);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL2";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/CaveLevel.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/frog_lvl_1.wav";

    public static readonly BACKGROUND_KEY = "BACKGROUND";
    public static readonly BACKGROUND_PATH = "hw4_assets/images/Cave2.png";

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

    protected cheatsManager: CheatsManager;

    protected scabberPositions: Array<Vec2>;
    protected antPositions: Array<Vec2>;

    protected bossSpawnTriggerPos: Vec2;
    protected bossSpawnTriggerHalfSize: Vec2;
    
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
        this.tongueCollidableLayerKey = Level2.TONGUE_COLLIDABLE_LAYER_KEY;
        this.wallsLayerKey = Level2.WALLS_LAYER_KEY;

        // Set the key for the player's sprite
        this.playerSpriteKey = Level0.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level2.PLAYER_SPAWN;
        // Set the key for the spells sprite

        // Music and sound
        this.levelMusicKey = Level2.LEVEL_MUSIC_KEY;
        this.jumpAudioKey = Level0.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level0.ATTACK_AUDIO_KEY;
        this.healAudioKey = Level0.HEAL_AUDIO_KEY;
        this.hurtAudioKey = Level0.HURT_AUDIO_KEY;
        this.explodeAudioKey = Level0.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level0.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level0.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level0.PLAYER_DEATH_AUDIO_KEY;
        this.backgroundKey = Level2.BACKGROUND_KEY;

        // Level end size and position
        //this.levelEndPosition = new Vec2(790, 15).mult(this.tilemapScale);
        //this.levelEndPosition = new Vec2(1600, 1100)

        // made bigger for testing
        this.levelEndHalfSize = new Vec2(32, 30).mult(this.tilemapScale);


        this.bossSpawnTriggerPos = new Vec2(1260, 1104);
        this.bossSpawnTriggerHalfSize = new Vec2(10, 160).mult(this.tilemapScale);

        this.bossFightCenterPoint = new Vec2(1400, 1040);
        this.bossName = "Ant Queen";

        // Initialize cheats
        // Have to define and update cheatsManager in each individual level
        // to avoid circular dependencies
        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
        });

        this.currLevel = Level2;

        // Setup bg stuff
        this.bgScale = new Vec2(16.0, 16.0);
        this.bgOffset = new Vec2(400, 400).mult(this.tilemapScale);
        this.bgMovementScale = 0.7; // No parallax
        this.bgMovementScaleY = 0.8; // No parallax
    }

    public initializeUI(): void {
        super.initializeUI();

        const size = this.viewport.getHalfSize();

        // // Guide Textbox
        // this.guideText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.GUIDE, { position: new Vec2(this.playerSpawn.x + 90, this.playerSpawn.y - 50), text: "I HAVE SO MUCH TO SAY TO YOU" });
        // this.guideText.size.set(550, 180);
        // this.guideText.borderRadius = 25;
        // this.guideText.backgroundColor = new Color(34, 32, 52, 0);
        // this.guideText.textColor = Color.WHITE;
        // this.guideText.textColor.a = 0;
        // this.guideText.fontSize = 24;
        // this.guideText.font = "MyFont";

        // this.guideText.position = new Vec2(233, 981);

        // // add random tutorial text
        // this.tutorialText = <Label>this.add.uiElement(UIElementType.LABEL, AALayers.UI, {
        //     position: new Vec2(size.x, 180),
        //     text: "Try shooting fire at your feet to jump!",
        // });
        // this.tutorialText.size = new Vec2(300, 25);
        // // this.tutorialText.backgroundColor = Color.BLACK;
        // // this.tutorialText.backgroundColor.a = 10;
        // this.tutorialTextTimer = new Timer(10000, () => (this.tutorialText.visible = false), false);
    }


    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load the tongue shader
        super.loadScene();
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level2.TILEMAP_PATH);
        // Load in the player's sprite
        // this.load.spritesheet(this.playerSpriteKey, Level2.PLAYER_SPRITE_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Scabbers", "hw4_assets/spritesheets/scabbers2.json");

        // Load in the guide sprite
        this.load.spritesheet("Guide", "hw4_assets/spritesheets/traveler.json");

        // Load in ant sprite
        this.load.spritesheet("Ant", "hw4_assets/spritesheets/fire_ant.json");

        this.load.image(this.backgroundKey, Level2.BACKGROUND_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Ant", "hw4_assets/spritesheets/fire_ant.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level2.LEVEL_MUSIC_PATH);
        // this.load.audio(this.jumpAudioKey, Level2.JUMP_AUDIO_PATH);
        // this.load.audio(this.attackAudioKey, Level2.ATTACK_AUDIO_PATH);
        // this.load.audio(this.healAudioKey, Level2.HEAL_AUDIO_PATH);
        // this.load.audio(this.explodeAudioKey, Level2.EXPLODE_AUDIO_PATH);
        // this.load.audio(this.grappleAudioKey, Level2.GRAPPLE_AUDIO_PATH);
        // this.load.audio(this.enemyDeathAudioKey, Level2.ENEMY_DEATH_AUDIO_PATH);
        // this.load.audio(this.playerDeathAudioKey, Level2.PLAYER_DEATH_AUDIO_PATH);

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
        this.guideText.tweens.play("fadeIn");

        // Set the next level to be Level3
        this.nextLevel = Level3;
        this.nextLevelNum = 3;
        this.initializeTriggers();

        this.initializeNPCs();
    }

    protected initializeNPCs(): void {

        this.bossHealthBar.position = new Vec2(150, 195)
        this.bossHealthBarBg.position = new Vec2(150, 195)
        this.bossNameLabel.position = new Vec2(95, 187) 
        // initialize boss weapon system
        this.antParticleSystem = new AntParticles(1, Vec2.ZERO, 2000, 3, 10, 1);
        this.antParticleSystem.initializePool(this, AALayers.PRIMARY);

        const antQueen = this.add.animatedSprite("Ant", AALayers.PRIMARY);
        antQueen.scale.scale(1.25);
        antQueen.position.set(1405, 1010);
        antQueen.addPhysics();
        antQueen.setGroup(AAPhysicsGroups.ENEMY);
        antQueen.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
        antQueen.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICE_HIT_BOSS, null);
        antQueen.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_BOSS, null);
        antQueen.health = 10;
        antQueen.maxHealth = 10;

        antQueen.addAI(AntQueenBehavior, {
            player: this.player,
            particles: this.antParticleSystem,
        });
        this.allNPCS.set(antQueen.id, antQueen);
        
        antQueen.tweens.add("DEATH", {
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

        this.scabberPositions = [
            new Vec2(503, 1008),
            new Vec2(258, 848),
            new Vec2(69, 640),
            new Vec2(75, 640),
            new Vec2(824, 416),
        ];

        for (const pos of this.scabberPositions) {
            const scabbers = this.add.animatedSprite("Scabbers", AALayers.PRIMARY);
            scabbers.scale.scale(0.25);
            scabbers.position.set(pos.x, pos.y);
            scabbers.addPhysics();
            scabbers.setGroup(AAPhysicsGroups.ENEMY);
            scabbers.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
            scabbers.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICEBALL_HIT_ENEMY, null);
            scabbers.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);

            scabbers.health = 3;
            scabbers.maxHealth = 3;
            const healthbar = new HealthbarHUD(this, scabbers, AALayers.PRIMARY, {
                size: scabbers.size.clone().scaled(1.5, 0.25),
                offset: scabbers.size.clone().scaled(0, -1 / 5),
            });
            this.healthbars.set(scabbers.id, healthbar);
            scabbers.animation.play("IDLE");
            scabbers.addAI(ScabberBehavior, { player: this.player, tilemap: "Collidable" });
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
        }

        const guide = this.add.animatedSprite("Guide", AALayers.GUIDE);
        guide.scale.scale(0.3);
        guide.position.set(233, 1021);
        guide.addPhysics(null, null, false);
        guide.setGroup(AAPhysicsGroups.TUTORIAL);
        guide.setTrigger(AAPhysicsGroups.PLAYER, "GUIDE", null);

        guide.animation.play("IDLE");
        this.allNPCS.set(guide.id, guide);

        this.antPositions = [
            new Vec2(400, 894),
            new Vec2(470, 300),
            new Vec2(200, 300),
            new Vec2(622, 950),
            new Vec2(438, 750),
            new Vec2(495, 550),
            new Vec2(833, 350),
            new Vec2(1268, 700),
            new Vec2(936, 576),
            new Vec2(788, 600),
            new Vec2(1101, 1000),
            new Vec2(1000, 1000),
            new Vec2(1158, 640),
            new Vec2(1300, 1110),
            new Vec2(1500, 1110),
        ];

        for(const pos of this.antPositions){

            const ant = this.add.animatedSprite("Ant", AALayers.GUIDE);
            ant.scale.scale(.25)
            ant.position.set(pos.x, pos.y)
            ant.addPhysics(null, null, false)
            ant.setGroup(AAPhysicsGroups.ENEMY)
            ant.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_ENEMY, null);

            ant.animation.play("IDLE");
            ant.addAI(AntBehavior, { player: this.player });
            ant.health = 3;
            ant.maxHealth = 3;
            const healthbar = new HealthbarHUD(this, ant, AALayers.PRIMARY, {
                size: ant.size.clone().scaled(1.5, 0.125),
                offset: ant.size.clone().scaled(0, -1 / 5),
            });
            this.healthbars.set(ant.id, healthbar);
            this.allNPCS.set(ant.id, ant);

        }
      
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
        this.viewport.setBounds(16, 16, 1600, 1300);
    }
}
