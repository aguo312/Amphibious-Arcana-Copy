import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import AALevel, { AALayers } from "./AALevel";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Level2 from "./AALevel2";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import { AAEvents } from "../AAEvents";
import ScabberBehavior from "../AI/NPC/NPCBehaviors/ScabberBehavior";
import HealthbarHUD from "../GameSystems/HUD/HealthbarHUD";
import CheatsManager from "../CheatsManager";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import Level0 from "./AALevel0";

export default class Level1 extends AALevel {
    public static readonly PLAYER_SPAWN = new Vec2(50, 935);

    public static readonly TILEMAP_KEY = "LEVEL1";
    public static readonly TILEMAP_PATH = "hw4_assets/tilemaps/TreeLevel.json";
    public static readonly TILEMAP_SCALE = new Vec2(2, 2);
    public static readonly COLLIDABLE_LAYER_KEY = "Collidable";
    public static readonly TONGUE_COLLIDABLE_LAYER_KEY = "TongueCollidable";
    public static readonly WALLS_LAYER_KEY = "Main";

    public static readonly LEVEL_MUSIC_KEY = "LEVEL_MUSIC";
    public static readonly LEVEL_MUSIC_PATH = "hw4_assets/music/frog_lvl_1.wav";

    public static readonly BACKGROUND_KEY = "BACKGROUND";
    public static readonly BACKGROUND_PATH = "hw4_assets/images/level1.png";

    public static readonly LEVEL_END = new AABB(new Vec2(1400, 232), new Vec2(24, 16));

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
        this.backgroundKey = Level1.BACKGROUND_KEY;

        // Level end size and position
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

        // Setup bg stuff
        this.bgScale = new Vec2(8.0, 12.0);
        this.bgOffset = new Vec2(100, 220).mult(this.tilemapScale);
        this.bgMovementScale = 0.7;
        this.bgMovementScaleY = 0.5;
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

        this.guideText.position = new Vec2(471, 891);
        this.guideText.size.set(655, 150);

        //this.guideText.size.set(655, 150);
    }

    /**
     * Load in our resources for level 1
     */
    public loadScene(): void {
        // Load the tongue shader
        super.loadScene();
        // Load in the tilemap
        this.load.tilemap(this.tilemapKey, Level1.TILEMAP_PATH);

        // Load in the enemy sprites
        this.load.spritesheet("Scabbers", "hw4_assets/spritesheets/scabbers2.json");

        // Load in the guide sprite
        this.load.spritesheet("Guide", "hw4_assets/spritesheets/traveler.json");

        // Load in ant sprite
        this.load.spritesheet("Ant", "hw4_assets/spritesheets/fire_ant.json");

        this.load.image(this.backgroundKey, Level1.BACKGROUND_PATH);

        // Audio and music
        this.load.audio(this.levelMusicKey, Level1.LEVEL_MUSIC_PATH);
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

        // Set the next level to be Level4
        this.nextLevel = Level2;
        this.nextLevelNum = 2;

        this.initializeNPCs();
    }

    protected initializeNPCs(): void {
        this.enemyPositions = [
            new Vec2(717, 1088),
            new Vec2(1051, 1024),
            new Vec2(942, 928),
            new Vec2(737, 800),
            new Vec2(1028, 592),
            new Vec2(727, 432),
            new Vec2(737, 80),
            new Vec2(900, 80),
            new Vec2(1133, 144),
            new Vec2(1400, 352),
            new Vec2(1550, 352),
            new Vec2(737, 800),
            new Vec2(1851, 304),
        ];

        for (const pos of this.enemyPositions) {
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
        guide.position.set(471, 941);
        guide.addPhysics(null, null, false);
        guide.setGroup(AAPhysicsGroups.TUTORIAL);
        guide.setTrigger(AAPhysicsGroups.PLAYER, "GUIDE", null);

        guide.animation.play("IDLE");
        this.allNPCS.set(guide.id, guide);
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
