import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel, { AALayers } from "./AALevel";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Color from "../../Wolfie2D/Utils/Color";
import Timer from "../../Wolfie2D/Timing/Timer";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import ScabberBehavior from "../AI/NPC/NPCBehaviors/ScabberBehavior";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import CheatsManager from "../CheatsManager";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import MainMenu from "./MainMenu";
import RangedEnemyBehavior from "../AI/NPC/NPCBehaviors/RangedEnemyBehavior";
import RangedEnemyParticles from "../AI/NPC/RangedEnemyParticles";
import MindFlayerParticles from "../AI/NPC/MindFlayerParticles";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import MindFlayerBehavior from "../AI/NPC/NPCBehaviors/MindFlayerBehavior";
import Level0 from "./AALevel0";
import Level5 from "./AALevel5";

/**
 * The first level for HW4 - should be the one with the grass and the clouds.
 */
export default class Level6 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(1952, 48);
    public static readonly PLAYER_SPRITE_KEY = "PLAYER_SPRITE_KEY";
    public static readonly PLAYER_SPRITE_PATH = "hw4_assets/spritesheets/Frog.json";

    public static readonly TILEMAP_KEY = "LEVEL1";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/AALevel6.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/dark_level_music.wav";

    public static readonly BOSS_MUSIC_KEY = "BOSS_MUSIC";
    public static readonly BOSS_MUSIC_PATH = "hw4_assets/music/dark_level_music_fast.wav";

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

    // public static readonly LEVEL_END = new AABB(new Vec2(1400, 232), new Vec2(24, 16));
    protected tutorialText: Label;
    protected tutorialTextTimer: Timer;

    protected bossSpawnTriggerPos: Vec2;
    protected bossSpawnTriggerHalfSize: Vec2;

    protected cheatsManager: CheatsManager;

    protected rangedEnemyParticleSystem: RangedEnemyParticles;

    protected mindFlayerParticleSystem: MindFlayerParticles;

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
        this.playerSpriteKey = Level0.PLAYER_SPRITE_KEY;
        // Set the player's spawn
        this.playerSpawn = Level6.PLAYER_SPAWN;
        // Set the key for the spells sprite

        // Music and sound
        this.levelMusicKey = Level6.LEVEL_MUSIC_KEY;
        this.bossMusicKey = Level6.BOSS_MUSIC_KEY;
        this.jumpAudioKey = Level0.JUMP_AUDIO_KEY;
        this.attackAudioKey = Level0.ATTACK_AUDIO_KEY;
        this.healAudioKey = Level0.HEAL_AUDIO_KEY;
        this.hurtAudioKey = Level0.HURT_AUDIO_KEY;
        this.explodeAudioKey = Level0.EXPLODE_AUDIO_KEY;
        this.grappleAudioKey = Level0.GRAPPLE_AUDIO_KEY;
        this.enemyDeathAudioKey = Level0.ENEMY_DEATH_AUDIO_KEY;
        this.playerDeathAudioKey = Level0.PLAYER_DEATH_AUDIO_KEY;

        // // Level end size and position
        // this.levelEndPosition = new Vec2(192, 24).mult(this.tilemapScale);

        // // made bigger for testing
        // this.levelEndHalfSize = new Vec2(16, 32).mult(this.tilemapScale);

        this.bossSpawnTriggerPos = new Vec2(162, 600).mult(this.tilemapScale);
        this.bossSpawnTriggerHalfSize = new Vec2(4, 16).mult(this.tilemapScale);

        this.bossFightCenterPoint = new Vec2(84, 583).mult(this.tilemapScale);
        this.bossName = "Mind Flayer";

        // Initialize cheats
        // Have to define and update cheatsManager in each individual level
        // to avoid circular dependencies
        this.cheatsManager = new CheatsManager(this.sceneManager, {
            levelMusicKey: this.levelMusicKey,
        });
        this.currLevel = Level6;
        MainMenu.BOSS_LOCATION = this.bossSpawnTriggerPos;
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
        this.load.spritesheet("Mind Flayer", "hw4_assets/spritesheets/mind_flayer.json");

        // Audio and music
        this.load.audio(this.levelMusicKey, Level6.LEVEL_MUSIC_PATH);
        this.load.audio(this.bossMusicKey, Level6.BOSS_MUSIC_PATH);
        // this.load.audio(this.jumpAudioKey, Level6.JUMP_AUDIO_PATH);
        // this.load.audio(this.attackAudioKey, Level6.ATTACK_AUDIO_PATH);
        // this.load.audio(this.healAudioKey, Level6.HEAL_AUDIO_PATH);
        // this.load.audio(this.explodeAudioKey, Level6.EXPLODE_AUDIO_PATH);
        // this.load.audio(this.grappleAudioKey, Level6.GRAPPLE_AUDIO_PATH);
        // this.load.audio(this.enemyDeathAudioKey, Level6.ENEMY_DEATH_AUDIO_PATH);
        // this.load.audio(this.playerDeathAudioKey, Level6.PLAYER_DEATH_AUDIO_PATH);

        // this.load.image("fireIcon", "hw4_assets/sprites/fire-icon.png");
        // this.load.image("tongueIcon", "hw4_assets/sprites/tongue-icon.png");
        // this.load.image("iceIcon", "hw4_assets/sprites/ice-icon.png");
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
        // Set the next level to be END
        // Return to main menu on completion
        this.nextLevel = MainMenu;
        this.nextLevelNum = 7;

        this.initializeNPCs();
        this.initializeTriggers();
    }

    protected initializeNPCs(): void {
        // regular enemies
        let melee = [
            new Vec2(30, 23).scale(16),
            new Vec2(44, 23).scale(16),
            new Vec2(66, 15).scale(16),
            new Vec2(102, 4).scale(16),
            new Vec2(66, 44).scale(16),
            new Vec2(81, 36).scale(16),
            new Vec2(100, 39).scale(16),
            new Vec2(120, 39).scale(16),
            new Vec2(82, 58).scale(16),
            new Vec2(127, 58).scale(16),
            new Vec2(35, 75).scale(16),
            new Vec2(54, 75).scale(16),
            new Vec2(76, 75).scale(16),
            new Vec2(110, 75).scale(16),
        ];
        let ranged = [
            new Vec2(87, 15).scale(16),
            new Vec2(120, 15).scale(16),
            new Vec2(9, 48).scale(16),
            new Vec2(43, 59).scale(16),
            new Vec2(55, 54).scale(16),
            new Vec2(92, 39).scale(16),
            new Vec2(114, 39).scale(16),
            new Vec2(94, 58).scale(16),
            new Vec2(105, 58).scale(16),
            new Vec2(45, 75).scale(16),
            new Vec2(65, 75).scale(16),
            new Vec2(87, 75).scale(16),
            new Vec2(8, 65).scale(16),
            new Vec2(16, 65).scale(16),
        ];
        melee.forEach((l) => {
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
            scabbers.addAI(ScabberBehavior, { player: this.player, tilemap: "Collidable" }); // add particles here
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
        ranged.forEach((l) => {
            this.rangedEnemyParticleSystem = new RangedEnemyParticles(1, Vec2.ZERO, 1000, 3, 10, 1);
            this.rangedEnemyParticleSystem.initializePool(this, AALayers.PRIMARY);
            const particles = this.rangedEnemyParticleSystem.getPool();
            particles.forEach((particle) => this.allNPCS.set(particle.id, particle));

            const scabbers = this.add.animatedSprite("Scabbers", AALayers.PRIMARY);
            scabbers.scale.scale(0.25);
            scabbers.position.set(l.x, l.y);
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
            scabbers.addAI(RangedEnemyBehavior, {
                player: this.player,
                particles: this.rangedEnemyParticleSystem,
                tilemap: "Collidable",
            });
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

        // level boss
        this.mindFlayerParticleSystem = new MindFlayerParticles(50, Vec2.ZERO, 1000, 3, 10, 50);
        this.mindFlayerParticleSystem.initializePool(this, AALayers.PRIMARY);
        const particles = this.mindFlayerParticleSystem.getPool();
        particles.forEach((particle) => this.allNPCS.set(particle.id, particle));

        const mindFlayer = this.add.animatedSprite("Mind Flayer", AALayers.PRIMARY);
        mindFlayer.scale.scale(0.25);
        mindFlayer.position.set(48, 592).mult(this.tilemapScale);
        mindFlayer.addPhysics(undefined, undefined, false, false);
        mindFlayer.setGroup(AAPhysicsGroups.ENEMY);
        mindFlayer.setTrigger(AAPhysicsGroups.FIREBALL, AAEvents.FIREBALL_HIT_ENEMY, null);
        mindFlayer.setTrigger(AAPhysicsGroups.ICE_PARTICLE, AAEvents.ICE_HIT_BOSS, null);
        mindFlayer.setTrigger(AAPhysicsGroups.TONGUE, AAEvents.TONGUE_HIT_BOSS, null);
        mindFlayer.health = 10;
        mindFlayer.maxHealth = 10;

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
        this.viewport.setBounds(16, 16, 2064, 1264);
    }
}
