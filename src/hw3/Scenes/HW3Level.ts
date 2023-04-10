import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";
import Input from "../../Wolfie2D/Input/Input";
import { TweenableProperties } from "../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Rect from "../../Wolfie2D/Nodes/Graphics/Rect";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import RenderingManager from "../../Wolfie2D/Rendering/RenderingManager";
import Scene from "../../Wolfie2D/Scene/Scene";
import SceneManager from "../../Wolfie2D/Scene/SceneManager";
import Viewport from "../../Wolfie2D/SceneGraph/Viewport";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../Wolfie2D/Utils/EaseFunctions";
import PlayerController, { PlayerTweens } from "../Player/PlayerController";
import Fireball from "../Player/Fireball";
import FireParticles from "../Player/FireParticles";

import { HW3Events } from "../HW3Events";
import { HW3PhysicsGroups } from "../HW3PhysicsGroups";
import HW3FactoryManager from "../Factory/HW3FactoryManager";
import MainMenu from "./MainMenu";
import TongueBehavior from "../Nodes/TongueBehavior";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import TongueShaderType from "../Shaders/TongueShaderType";
import { SpellTypes } from "../Player/SpellTypes";
import Sprite from "../../Wolfie2D/Nodes/Sprites/Sprite";
import IceParticles from "../Player/IceParticles";

/**
 * A const object for the layer names
 */
export const HW3Layers = {
    // The primary layer
    PRIMARY: "PRIMARY",
    // The UI layer
    UI: "UI"
} as const;

// The layers as a type
export type HW3Layer = typeof HW3Layers[keyof typeof HW3Layers]

/**
 * An abstract HW4 scene class.
 */
export default abstract class HW3Level extends Scene {

    /** Overrride the factory manager */
    public add: HW3FactoryManager;


    /** The particle system used for the fireball's explosion */
    protected fireParticleSystem: FireParticles;

    /** The fireball itself */
    protected fireballSystem: Fireball;
    protected fireballTimer: Timer;

    /** The particle system used for the ice blast */
    protected iceParticleSystem: IceParticles;

    /** The key for the player's animated sprite */
    protected playerSpriteKey: string;

    /** The key for the spells sprite */
    protected spellsSpriteKey: string;

    /** The animated sprite that is the player */
    protected player: AnimatedSprite;

    /** The sprite that is the fire icon */
    protected fireIcon: Sprite;
    protected tongueIcon: Sprite;
    protected iceIcon: Sprite;

    /** The player's spawn position */
    protected playerSpawn: Vec2;

    private tongue: Graphic;

	private healthBar: Label;
	private healthBarBg: Label;

    private spellBarSelect: Label;

    private tongueSelectPos: Vec2;
    private fireballSelectPos: Vec2;
    private iceSelectPos: Vec2;

    private selectedSpell: string;

    /** The end of level stuff */

    protected levelEndPosition: Vec2;
    protected levelEndHalfSize: Vec2;

    protected levelEndArea: Rect;
    protected nextLevel: new (...args: any) => Scene;
    protected nextLevelNum: number;
    protected levelEndTimer: Timer;
    protected levelEndLabel: Label;

    // Level end transition timer and graphic
    protected levelTransitionTimer: Timer;
    protected levelTransitionScreen: Rect;

    /** The keys to the tilemap and different tilemap layers */
    protected tilemapKey: string;
    //protected destructibleLayerKey: string;
    protected collidableLayerKey: string;
    protected tongueCollidableLayerKey: string;
    protected wallsLayerKey: string;
    /** The scale for the tilemap */
    protected tilemapScale: Vec2;
    /** The destrubtable layer of the tilemap */
    protected collidable: OrthogonalTilemap;
    /** The layer of the tilemap the tongue can collide with */
    protected tongueCollidable: OrthogonalTilemap;
    /** The wall layer of the tilemap */
    protected walls: OrthogonalTilemap;

    /** Sound and music */
    protected levelMusicKey: string;
    protected jumpAudioKey: string;
    protected tileDestroyedAudioKey: string;

    protected static readonly FIRE_ICON_PATH = "hw4_assets/icons/fire-icon.png";

    public constructor(viewport: Viewport, sceneManager: SceneManager, renderingManager: RenderingManager, options: Record<string, any>) {
        super(viewport, sceneManager, renderingManager, {...options, physics: {
            groupNames: [
                HW3PhysicsGroups.GROUND, 
                HW3PhysicsGroups.PLAYER, 
                HW3PhysicsGroups.FIREBALL, 
                HW3PhysicsGroups.FIRE_PARTICLE,
                HW3PhysicsGroups.DESTRUCTABLE,
                HW3PhysicsGroups.TONGUE_COLLIDABLE,
                HW3PhysicsGroups.TONGUE,
                HW3PhysicsGroups.ICE_PARTICLE,
                HW3PhysicsGroups.ENEMY
            ],
            collisions:
            [
                [0, 1, 1, 1, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 0, 0, 0, 1],
                [0, 1, 1, 1, 0, 0, 0, 0, 1],
                [0, 0, 0, 0, 0, 0, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 0, 0, 1]
            ]
        }});
        this.add = new HW3FactoryManager(this, this.tilemaps);

        this.tongueSelectPos = new Vec2(13.3, 25.5);
        this.fireballSelectPos = new Vec2(24.3, 25.5);
        this.iceSelectPos = new Vec2(35.3, 25.5);
        this.selectedSpell = SpellTypes.TONGUE;
    }

    public loadScene() {
        this.load.shader(
            TongueShaderType.KEY,
            TongueShaderType.VSHADER,
            TongueShaderType.FSHADER);
    }

    public startScene(): void {
        // Initialize the layers
        this.initLayers();

        // Initialize the tilemaps
        this.initializeTilemap();

        // Initialize the sprite and particle system for the players weapon 
        this.initializeWeaponSystem();

        // Initialize the player 
        this.initializePlayer(this.playerSpriteKey);

        // Initialize the viewport - this must come after the player has been initialized
        this.initializeViewport();
        this.subscribeToEvents();
        this.initializeUI();
        

        // Initialize the ends of the levels - must be initialized after the primary layer has been added
        this.initializeLevelEnds();

        this.levelTransitionTimer = new Timer(500);
        this.levelEndTimer = new Timer(3000, () => {
            // After the level end timer ends, fade to black and then go to the next scene
            this.levelTransitionScreen.tweens.play("fadeIn");
        });

        // Init timers
        this.fireballTimer = new Timer(1000);

        // Initially disable player movement
        Input.disableInput();

        // Start the black screen fade out
        this.levelTransitionScreen.tweens.play("fadeOut");

        // Start playing the level music for the HW4 level
        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {key: this.levelMusicKey, loop: true, holdReference: true});
    }

    /* Update method for the scene */

    public updateScene(deltaT: number) {
        // Handle all game events
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (this.tongue.visible) {
            this.emitter.fireEvent(HW3Events.PLAYER_POS_UPDATE, {pos: this.player.position.clone()});
        }
    }

    /**
     * Handle game events. 
     * @param event the game event
     */
    protected handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW3Events.PLAYER_ENTERED_LEVEL_END: {
                this.handleEnteredLevelEnd();
                break;
            }
            // When the level starts, reenable user input
            case HW3Events.LEVEL_START: {
                Input.enableInput();
                break;
            }
            // When the level ends, change the scene to the next level
            case HW3Events.LEVEL_END: {
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusicKey});
                MainMenu.LEVEL_COUNTER = this.nextLevelNum;
                this.sceneManager.changeToScene(this.nextLevel);
                break;
            }
            case HW3Events.PARTICLE_HIT_DESTRUCTIBLE: {
                if (this.fireballTimer.isStopped()) {
                    this.fireballTimer.start();
                    this.handleFireballHit();
                }
                break;
            }
            case HW3Events.HEALTH_CHANGE: {
                this.handleHealthChange(event.data.get("curhp"), event.data.get("maxhp"));
                break;
            }
            case HW3Events.PLAYER_DEAD: {
                MainMenu.GAME_PLAYING = false;
                this.emitter.fireEvent(GameEventType.STOP_SOUND, {key: this.levelMusicKey});
                this.emitter.fireEvent(GameEventType.PLAY_MUSIC, {key: MainMenu.MUSIC_KEY});
                this.sceneManager.changeToScene(MainMenu);
                break;
            }
            case HW3Events.SHOOT_TONGUE: {
                let pos = event.data.get("pos");
                let dir = event.data.get("dir");
                this.spawnTongue(pos, dir);
                break;
            }
            // Handle spell switching
            case HW3Events.SELECT_TONGUE: {
                this.handleSelectTongue();
                break;
            }
            case HW3Events.SELECT_FIREBALL: {
                this.handleSelectFireball();
                break;
            }
            case HW3Events.SELECT_ICE: {
                this.handleSelectIce();
                break;
            }
            // case HW3Events.PLAYER_ATTACK: {
            //     this.handlePlayerAttack();
            //     break;
            // }
            // Default: Throw an error! No unhandled events allowed.
            default: {
                throw new Error(`Unhandled event caught in scene with type ${event.type}`)
            }
        }
    }

    protected spawnTongue(pos: Vec2, dir: Vec2): void {
        // TODO maybe use GameNode?
        if (this.tongue && !this.tongue.visible) {
            this.tongue.visible = true;
            this.tongue.setAIActive(true, {src: pos, dir: dir});
        }
    }

    // protected handlePlayerAttack(): void {
    //     switch(this.selectedSpell) {
    //         case SpellTypes.TONGUE: {
    //             break;
    //         }
    //         case SpellTypes.FIREBALL: {
    //             break;
    //         }
    //         case SpellTypes.ICE: {
    //             break;
    //         }
    //         default: {
    //             throw new Error(`Unhandled attack type ${this.selectedSpell} caught in handlePlayerAttack()`);
    //         }
    //     }
    // }

    protected handleSelectTongue(): void {
        this.selectedSpell = SpellTypes.TONGUE;
        this.spellBarSelect.position = this.tongueSelectPos.clone();
    }

    protected handleSelectFireball(): void {
        this.selectedSpell = SpellTypes.FIREBALL;
        this.spellBarSelect.position = this.fireballSelectPos.clone();
    }

    protected handleSelectIce(): void {
        this.selectedSpell = SpellTypes.ICE;
        this.spellBarSelect.position = this.iceSelectPos.clone();
    }

    /* Handlers for the different events the scene is subscribed to */

    protected handleFireballHit(): void {
        let particle = this.fireballSystem.getPool()[0];  // fireball is a single particle

        if (!particle) {
            console.warn('Fireball particle undefined');
            return;
        }

        // Rocket jump direction
        // TODO should be less effective when fireball lands farther away
        let dir = new Vec2(-0.8*particle.vel.x, -0.8*particle.vel.y);

        this.fireballSystem.stopSystem();

        if (!this.fireParticleSystem.isSystemRunning()) {
            this.fireParticleSystem.setParticleVector(dir);
            this.fireParticleSystem.startSystem(1000, 0, particle.position);
        }

        this.emitter.fireEvent(HW3Events.PLAYER_FIRE_JUMP, { fireJumpVel: dir, particlePos: particle.position, playerPos: this.player.position });
    }

    /**
     * Handle the event when the player enters the level end area.
     */
    protected handleEnteredLevelEnd(): void {
        // If the timer hasn't run yet, start the end level animation
        if (!this.levelEndTimer.hasRun() && this.levelEndTimer.isStopped()) {
            this.levelEndTimer.start();
            this.levelEndLabel.tweens.play("slideIn");
        }
    }
    /**
     * This is the same healthbar I used for hw2. I've adapted it slightly to account for the zoom factor. Other than that, the
     * code is basically the same.
     * 
     * @param currentHealth the current health of the player
     * @param maxHealth the maximum health of the player
     */
    protected handleHealthChange(currentHealth: number, maxHealth: number): void {
		let unit = this.healthBarBg.size.x / maxHealth;
        
		this.healthBar.size.set(this.healthBarBg.size.x - unit * (maxHealth - currentHealth), this.healthBarBg.size.y);
		this.healthBar.position.set(this.healthBarBg.position.x - (unit / 2 / this.getViewScale()) * (maxHealth - currentHealth), this.healthBarBg.position.y);

		this.healthBar.backgroundColor = currentHealth < maxHealth * 1/4 ? Color.RED: currentHealth < maxHealth * 3/4 ? Color.YELLOW : Color.GREEN;
	}

    /* Initialization methods for everything in the scene */

    /**
     * Initialzes the layers
     */
    protected initLayers(): void {
        // Add a layer for UI
        this.addUILayer(HW3Layers.UI);
        // Add a layer for players and enemies
        this.addLayer(HW3Layers.PRIMARY);
    }
    /**
     * Initializes the tilemaps
     * @param key the key for the tilemap data
     * @param scale the scale factor for the tilemap
     */
    protected initializeTilemap(): void {
        if (this.tilemapKey === undefined || this.tilemapScale === undefined) {
            throw new Error("Cannot add the homework 4 tilemap unless the tilemap key and scale are set.");
        }
        // Add the tilemap to the scene
        this.add.tilemap(this.tilemapKey, this.tilemapScale);

        if (this.collidableLayerKey === undefined || this.tongueCollidableLayerKey === undefined) {
            throw new Error("Make sure the keys for the collidable layer and tongue collidable layer are both set");
        }

        // Get the wall and destructible layers 
        //this.walls = this.getTilemap(this.wallsLayerKey) as OrthogonalTilemap;
        this.collidable = this.getTilemap(this.collidableLayerKey) as OrthogonalTilemap;
        this.tongueCollidable = this.getTilemap(this.tongueCollidableLayerKey) as OrthogonalTilemap;

        // Add physics to the destructible layer of the tilemap
        if (this.collidable) {
            this.collidable.addPhysics();
            this.collidable.setGroup(HW3PhysicsGroups.DESTRUCTABLE);
            this.collidable.setTrigger(HW3PhysicsGroups.FIREBALL, HW3Events.PARTICLE_HIT_DESTRUCTIBLE, null);
            this.collidable.setTrigger(HW3PhysicsGroups.TONGUE, HW3Events.TONGUE_WALL_COLLISION, null);

        }

        // this.tongueCollidable.addPhysics();
        // this.tongueCollidable.setGroup(HW3PhysicsGroups.TONGUE_COLLIDABLE);
    }
    /**
     * Handles all subscriptions to events
     */
    protected subscribeToEvents(): void {
        this.receiver.subscribe(HW3Events.PLAYER_ENTERED_LEVEL_END);
        this.receiver.subscribe(HW3Events.LEVEL_START);
        this.receiver.subscribe(HW3Events.LEVEL_END);
        this.receiver.subscribe(HW3Events.PARTICLE_HIT_DESTRUCTIBLE);
        this.receiver.subscribe(HW3Events.HEALTH_CHANGE);
        this.receiver.subscribe(HW3Events.PLAYER_DEAD);
        this.receiver.subscribe(HW3Events.SHOOT_TONGUE);
        this.receiver.subscribe(HW3Events.SELECT_TONGUE);
        this.receiver.subscribe(HW3Events.SELECT_FIREBALL);
        this.receiver.subscribe(HW3Events.SELECT_ICE);
    }
    /**
     * Adds in any necessary UI to the game
     */
    protected initializeUI(): void {

        // HP Label
		// this.healthLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(10, 15), text: "HP "});
		// this.healthLabel.size.set(300, 30);
		// this.healthLabel.fontSize = 24;
		// this.healthLabel.font = "Courier";

        // HealthBar
		this.healthBar = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(45, 15), text: ""});
		this.healthBar.size = new Vec2(300, 25);
		this.healthBar.backgroundColor = Color.GREEN;
        this.healthBar.borderRadius = 0;

        // HealthBar Border
		this.healthBarBg = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: new Vec2(45, 15), text: ""});
		this.healthBarBg.size = new Vec2(300, 25);
		this.healthBarBg.borderColor = Color.BLACK;
        this.healthBarBg.borderRadius = 0;
        this.healthBarBg.borderWidth = 2;

        // The tongue icon sprite
        this.tongueIcon = this.add.sprite('tongueIcon', HW3Layers.UI);
        this.tongueIcon.scale.set(0.7, 0.7);
        this.tongueIcon.position.copy(this.tongueSelectPos);

        // The fire icon sprite
        this.fireIcon = this.add.sprite('fireIcon', HW3Layers.UI);
        this.fireIcon.scale.set(0.7, 0.7);
        this.fireIcon.position.copy(this.fireballSelectPos);

        // The ice icon sprite
        this.iceIcon = this.add.sprite('iceIcon', HW3Layers.UI);
        this.iceIcon.scale.set(0.7, 0.7);
        this.iceIcon.position.copy(this.iceSelectPos);

        // Spellbar highlighted spell border thing
        this.spellBarSelect = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, {position: this.tongueSelectPos, text: ""});
        this.spellBarSelect.size = new Vec2(45, 45);
        this.spellBarSelect.borderColor = Color.YELLOW;
        this.spellBarSelect.borderRadius = 0;
        this.spellBarSelect.borderWidth = 2;

        // End of level label (start off screen)
        this.levelEndLabel = <Label>this.add.uiElement(UIElementType.LABEL, HW3Layers.UI, { position: new Vec2(-300, 100), text: "Level Complete" });
        this.levelEndLabel.size.set(1200, 60);
        this.levelEndLabel.borderRadius = 0;
        this.levelEndLabel.backgroundColor = new Color(34, 32, 52);
        this.levelEndLabel.textColor = Color.WHITE;
        this.levelEndLabel.fontSize = 48;
        this.levelEndLabel.font = "PixelSimple";

        // Add a tween to move the label on screen
        this.levelEndLabel.tweens.add("slideIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.posX,
                    start: -300,
                    end: 150,
                    ease: EaseFunctionType.OUT_SINE
                }
            ]
        });

        this.levelTransitionScreen = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.UI, { position: new Vec2(300, 200), size: new Vec2(600, 400) });
        this.levelTransitionScreen.color = new Color(34, 32, 52);
        this.levelTransitionScreen.alpha = 1;

        this.levelTransitionScreen.tweens.add("fadeIn", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 0,
                    end: 1,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW3Events.LEVEL_END
        });

        /*
             Adds a tween to fade in the start of the level. After the tween has
             finished playing, a level start event gets sent to the EventQueue.
        */
        this.levelTransitionScreen.tweens.add("fadeOut", {
            startDelay: 0,
            duration: 1000,
            effects: [
                {
                    property: TweenableProperties.alpha,
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW3Events.LEVEL_START
        });
    }
    /**
     * Initializes the particles system used by the player's weapon.
     */
    protected initializeWeaponSystem(): void {
        this.fireParticleSystem = new FireParticles(50, Vec2.ZERO, 2000, 3, 10, 50); // TODO try changing mass to see if it affects gravity?
        this.fireParticleSystem.initializePool(this, HW3Layers.PRIMARY);

        this.fireballSystem = new Fireball(1, Vec2.ZERO, 1000, 3, 0, 1);
        this.fireballSystem.initializePool(this, HW3Layers.PRIMARY);

        // init tongue
        this.tongue = this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, {position: Vec2.ZERO, size: Vec2.ZERO});
        this.tongue.useCustomShader(TongueShaderType.KEY);
        this.tongue.color = Color.RED;
        this.tongue.visible = false;
        this.tongue.addAI(TongueBehavior, {src: Vec2.ZERO, dir: Vec2.ZERO});
        
        //Attempt to add physics to the tongue
        this.tongue.addPhysics();
        this.tongue.setGroup(HW3PhysicsGroups.TONGUE)

        // initialize Ice Blast
        this.iceParticleSystem = new IceParticles(1, Vec2.ZERO, 2000, 3, 10, 1);
        this.iceParticleSystem.initializePool(this, HW3Layers.PRIMARY);
    }
    /**
     * Initializes the player, setting the player's initial position to the given position.
     * @param position the player's spawn position
     */
    protected initializePlayer(key: string): void {
        if (this.fireParticleSystem === undefined) {
            throw new Error("Fire particle system must be initialized before initializing the player!");
        }
        if (this.iceParticleSystem === undefined) {
            throw new Error("Ice particle system must be initialized before initializing the player!");
        }
        if (this.playerSpawn === undefined) {
            throw new Error("Player spawn must be set before initializing the player!");
        }

        // Add the player to the scene
        this.player = this.add.animatedSprite(key, HW3Layers.PRIMARY);
        this.player.scale.set(.25, .25);
        this.player.position.copy(this.playerSpawn);
        
        // Give the player physics and setup collision groups and triggers for the player
        this.player.addPhysics(new AABB(this.player.position.clone(), this.player.boundary.getHalfSize().clone()));
        this.player.setGroup(HW3PhysicsGroups.PLAYER);

        // Give the player a flip animation
        this.player.tweens.add(PlayerTweens.FLIP, {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: 2*Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ]
        });
        // Give the player a death animation
        this.player.tweens.add(PlayerTweens.DEATH, {
            startDelay: 0,
            duration: 500,
            effects: [
                {
                    property: "rotation",
                    start: 0,
                    end: Math.PI,
                    ease: EaseFunctionType.IN_OUT_QUAD
                },
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_QUAD
                }
            ],
            onEnd: HW3Events.PLAYER_DEAD
        });

        // Give the player it's AI
        // This is just the option object, can pass in whatever "weapons" we want here
        this.player.addAI(PlayerController, { 
            fireParticleSystem: this.fireParticleSystem, // TODO do we need these in HW3Level?
            fireballSystem: this.fireballSystem,
            iceParticleSystem: this.iceParticleSystem,
            tilemap: "Destructable"
        });
    }
    /**
     * Initializes the viewport
     */
    protected initializeViewport(): void {
        if (this.player === undefined) {
            throw new Error("Player must be initialized before setting the viewport to folow the player");
        }
        this.viewport.follow(this.player);
        this.viewport.setZoomLevel(4);
        this.viewport.setBounds(0, 0, 512, 512);
    }
    /**
     * Initializes the level end area
     */
    protected initializeLevelEnds(): void {
        if (!this.layers.has(HW3Layers.PRIMARY)) {
            throw new Error("Can't initialize the level ends until the primary layer has been added to the scene!");
        }
        
        this.levelEndArea = <Rect>this.add.graphic(GraphicType.RECT, HW3Layers.PRIMARY, { position: this.levelEndPosition, size: this.levelEndHalfSize });
        this.levelEndArea.addPhysics(undefined, undefined, false, true);
        this.levelEndArea.setTrigger(HW3PhysicsGroups.PLAYER, HW3Events.PLAYER_ENTERED_LEVEL_END, null);
        this.levelEndArea.color = new Color(255, 0, 255, .20);
        
    }

    /* Misc methods */

    // Get the key of the player's jump audio file
    public getJumpAudioKey(): string {
        return this.jumpAudioKey
    }
}