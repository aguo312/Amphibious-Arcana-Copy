import StateMachineAI from "../../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import Jump from "./PlayerStates/Jump";
import Run from "./PlayerStates/Run";

import Fireball from "./Fireball";
import Input from "../../../Wolfie2D/Input/Input";

import { AAControls } from "../../AAControls";
import AAAnimatedSprite from "../../Nodes/AAAnimatedSprite";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { AAEvents } from "../../AAEvents";
import Dead from "./PlayerStates/Dead";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { SpellTypes } from "./SpellTypes";
import IceParticles from "./IceParticles";
import TongueParticle from "./TongueParticle";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";
import { GameEventType } from "../../../Wolfie2D/Events/GameEventType";
import Timer from "../../../Wolfie2D/Timing/Timer";
import MainMenu from "../../Scenes/MainMenu";

/**
 * Animation keys for the player spritesheet
 */
export const PlayerAnimations = {
    IDLE: "IDLE",
    WALK: "WALK",
    JUMP: "JUMP",
    FALL: "FALL",
    ATTACK: "ATTACK",
    TAKING_DAMAGE: "TAKING_DAMAGE",
    DYING: "DYING",
    JUMP_ATTACK: "JUMP_ATTACK",
} as const;

/**
 * Tween animations the player can player.
 */
export const PlayerTweens = {
    FLIP: "FLIP",
    DEATH: "DEATH",
} as const;

/**
 * Keys for the states the PlayerController can be in.
 */
export const PlayerStates = {
    IDLE: "IDLE",
    RUN: "RUN",
    JUMP: "JUMP",
    FALL: "FALL",
    DEAD: "DEAD",
} as const;

/**
 * The controller that controls the player.
 */
export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 300;
    public readonly MIN_SPEED: number = 130;

    /** Health and max health for the player */
    protected _health: number;
    protected _maxHealth: number;
    protected _previousHealth: number;

    /** The players game node */
    protected owner: AAAnimatedSprite;

    protected _velocity: Vec2;
    protected _speed: number;

    protected tilemap: OrthogonalTilemap;
    // protected cannon: Sprite;
    //protected weapon: Fireball;
    protected fireParticles: Fireball;
    protected fireProjectile: Fireball;

    protected tongueProjectile: TongueParticle;

    protected iceParticles: IceParticles;

    protected selectedSpell: string;

    protected receiver: Receiver;

    protected tongueGraphic: Graphic;

    protected isInvincible: boolean;

    public isFirejumpActive: boolean;
    public isGrappleActive: boolean;

    protected iFramesTimer: Timer;

    protected npcs: Map<number, AAAnimatedSprite>;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>) {
        this.owner = owner;

        this.tongueGraphic = options.tongueGraphic;

        //this.weapon = options.weaponSystem;
        this.fireParticles = options.fireParticleSystem;
        this.fireProjectile = options.fireballSystem;
        this.tongueProjectile = options.tongueParticleSystem;
        this.iceParticles = options.iceParticleSystem;
        this.npcs = options.allNPCs;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 5;
        this.maxHealth = 5;
        this._previousHealth = this.health;

        this.isFirejumpActive = false;
        this.isGrappleActive = false;

        // Add the different states the player can be in to the PlayerController
        this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
        this.addState(PlayerStates.RUN, new Run(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));

        // Start the player in the Idle state
        this.initialize(PlayerStates.IDLE);

        this.selectedSpell = SpellTypes.TONGUE;
        // this.selectedSpell = SpellTypes.FIREBALL;

        this.isInvincible = false;

        this.iFramesTimer = new Timer(2000, null, false);

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.PLAYER_FIRE_JUMP);
        this.receiver.subscribe(AAEvents.PLAYER_SWING);
        this.receiver.subscribe(AAEvents.TOGGLE_INVINCIBILITY);
        this.receiver.subscribe(AAEvents.PLAYER_HIT);
        this.receiver.subscribe(AAEvents.KILL_PLAYER);
        this.receiver.subscribe(AAEvents.PLAYER_HEAL);

        this.emitter.fireEvent(AAEvents.HEALTH_CHANGE, {
            curhp: this.health,
            maxhp: this.maxHealth,
        });
    }

    handleEvent(event: GameEvent): void {
        switch (event.type) {
            // Move player on a fireball jump
            case AAEvents.PLAYER_FIRE_JUMP: {
                const vel: Vec2 = event.data.get("fireJumpVel");
                const playerPos: Vec2 = event.data.get("playerPos");
                const particlePos: Vec2 = event.data.get("particlePos");

                // attempt to scale movement vector by difference in position
                const posDiff = MathUtils.clamp(playerPos.clone().distanceTo(particlePos), 0, 50);
                const scaleFactor =
                    posDiff >= 50
                        ? 0
                        : MathUtils.clamp(Math.pow(25, 0.8) - 0.7 * Math.pow(posDiff, 0.8), 0, 8);

                this.velocity.x += vel.clone().scale(scaleFactor).x;
                this.velocity.y += vel.clone().scale(scaleFactor).y;

                this.isFirejumpActive = true;

                console.log("posDiff: " + posDiff + ", scaleFactor: " + scaleFactor);

                break;
            }
            case AAEvents.KILL_PLAYER: {
                this.owner.health = 0;
                break;
            }
            case AAEvents.PLAYER_SWING: {
                const dir: Vec2 = event.data.get("swingDir");
                // const playerPos: Vec2 = event.data.get("playerPos");
                // const particlePos: Vec2 = event.data.get("particlePos");

                this.velocity.mult(Vec2.ZERO);
                this.velocity.add(dir);

                // // Calculate the distance between the player and the grapple point
                // const posDiff = playerPos.clone().distanceTo(particlePos);

                // // Scale the velocity based on the distance between the player and the grapple point
                // const minSwingDist = 5; // The minimum distance for a successful swing
                // const maxSwingDist = 20; // The maximum distance for a successful swing
                // let scaleFactor = MathUtils.clamp((posDiff - minSwingDist) / (maxSwingDist - minSwingDist), 0, 1) * 3;

                // // Adjust the scaling factor based on the state of the player
                // if (this.currentState instanceof Fall || this.currentState instanceof Jump) {
                //     scaleFactor *= 1.5;
                // }

                // // Set the velocity of the player
                // this.velocity = dir.clone().scale(scaleFactor);
                this.isGrappleActive = true;
                break;
            }
            case AAEvents.TOGGLE_INVINCIBILITY: {
                this.isInvincible = !this.isInvincible;
                break;
            }
            case AAEvents.PLAYER_HIT: {
                if (this.iFramesTimer.isStopped()) {
                    this.health -= 1;
                    // TODO push player a bit when taking damage, currently not working
                    // let enemyId = event.data.get('node');
                    // let enemy = this.npcs.get(enemyId);
                    // if (!enemy) {
                    //     console.log('failed to find enemy');
                    // }
                    // let vec = enemy.position.dirTo(this.owner.position).scale(10);
                    // this.velocity.x += vec.x;
                    // this.velocity.y += vec.y;
                    this.iFramesTimer.start();
                }
                break;
            }
            case AAEvents.PLAYER_HEAL: {
                // if (this.iFramesTimer.isStopped()) {
                //     this.health += 1;
                //     this.iFramesTimer.start();
                // }
                // testing this since you cant regain health from consuming
                // soon after taking damage with previous code
                this.health += 1;
                this.iFramesTimer.start();
                break;
            }
            default: {
                throw new Error(
                    `Unhandled event caught in player controller with type ${event.type}`
                );
            }
        }
    }

    /**
     * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
     */
    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
        direction.x =
            (Input.isPressed(AAControls.MOVE_LEFT) ? -1 : 0) +
            (Input.isPressed(AAControls.MOVE_RIGHT) ? 1 : 0);
        direction.y = Input.isJustPressed(AAControls.JUMP) ? -1 : 0;
        return direction;
    }
    /**
     * Gets the direction of the mouse from the player's position as a Vec2
     */
    public get faceDir(): Vec2 {
        return this.owner.position.dirTo(Input.getGlobalMousePosition());
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        // TODO not sure if should be before or after super call
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update the rotation to apply the particles velocity vector
        //this.fireParticles.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
        this.fireProjectile.rotation = 2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
        this.tongueProjectile.rotation = 2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
        this.iceParticles.rotation = 2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;

        // Attack
        if (Input.isMouseJustPressed()) {
            //this.tilemap.setTileAtRowCol(this.tilemap.getColRowAt(Input.getGlobalMousePosition()),5);
            switch (this.selectedSpell) {
                case SpellTypes.TONGUE: {
                    this.tongueAttack();
                    break;
                }
                case SpellTypes.FIREBALL: {
                    this.fireballAttack();
                    break;
                }
                case SpellTypes.ICE: {
                    this.iceAttack();
                    break;
                }
                default: {
                    throw new Error(
                        `Unhandled attack type ${this.selectedSpell} caught in handlePlayerAttack()`
                    );
                }
            }
            this.emitter.fireEvent(AAEvents.PLAYER_ATTACK);
        }

        // Set the selected spell
        if (Input.isJustPressed(AAControls.SELECT_TONGUE)) {
            if (MainMenu.CURRENT_LEVEL >= 1) {
                this.selectedSpell = SpellTypes.TONGUE;
                this.emitter.fireEvent(AAEvents.SELECT_TONGUE);
            }
        }
        if (Input.isJustPressed(AAControls.SELECT_FIREBALL)) {
            if (MainMenu.CURRENT_LEVEL >= 3) {
                this.selectedSpell = SpellTypes.FIREBALL;
                this.emitter.fireEvent(AAEvents.SELECT_FIREBALL);
            }
        }
        if (Input.isJustPressed(AAControls.SELECT_ICE)) {
            if (MainMenu.CURRENT_LEVEL >= 5) {
                this.selectedSpell = SpellTypes.ICE;
                this.emitter.fireEvent(AAEvents.SELECT_ICE);
            }
        }

        // Handles pausing the game
        if (Input.isJustPressed(AAControls.PAUSE)) {
            this.emitter.fireEvent(AAEvents.PAUSE);
        }

        // console.log('velocity: ' + this.velocity);
    }

    protected tongueAttack(): void {
        if (!this.tongueProjectile.isSystemRunning() && !this.tongueGraphic.visible) {
            this.tongueProjectile.getPool()[0].unfreeze();
            // Update the rotation to apply the particles velocity vector
            this.tongueProjectile.rotation =
                2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.tongueProjectile.startSystem(1000, 0, this.owner.position);
            if (this.owner.onGround) {
                this.owner.animation.play(PlayerAnimations.ATTACK);
            } else {
                this.owner.animation.play(PlayerAnimations.JUMP_ATTACK);
            }

            this.emitter.fireEvent(AAEvents.SHOOT_TONGUE, {
                pos: this.owner.position,
                dir: this.faceDir,
            });
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
                key: this.owner.getScene().getAttackAudioKey(),
                loop: false,
                holdReference: false,
            });
        }
    }

    protected fireballAttack(): void {
        // If the player hits the attack button and the weapon system isn't running, restart the system and fire!
        if (!this.fireProjectile.isSystemRunning() && !this.fireParticles.isSystemRunning()) {
            this.fireProjectile.getPool()[0].unfreeze();

            // Update the rotation to apply the particles velocity vector
            this.fireProjectile.rotation = 2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.fireProjectile.startSystem(500, 0, this.owner.position);
            if (this.owner.onGround) {
                this.owner.animation.play(PlayerAnimations.ATTACK);
            } else {
                this.owner.animation.play(PlayerAnimations.JUMP_ATTACK);
            }
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
                key: this.owner.getScene().getAttackAudioKey(),
                loop: false,
                holdReference: false,
            });
        }
    }

    protected iceAttack(): void {
        if (!this.iceParticles.isSystemRunning()) {
            this.iceParticles.getPool()[0].unfreeze();
            // Update the rotation to apply the particles velocity vector
            this.iceParticles.rotation = 2 * Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            if (this.owner.onGround) {
                this.owner.animation.play(PlayerAnimations.ATTACK);
            } else {
                this.owner.animation.play(PlayerAnimations.JUMP_ATTACK);
            }
            // Start the particle system at the player's current position
            this.iceParticles.startSystem(500, 0, this.owner.position);
            this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
                key: this.owner.getScene().getAttackAudioKey(),
                loop: false,
                holdReference: false,
            });
        }
    }

    public get velocity(): Vec2 {
        return this._velocity;
    }
    public set velocity(velocity: Vec2) {
        this._velocity = velocity;
    }

    public get speed(): number {
        return this._speed;
    }
    public set speed(speed: number) {
        this._speed = speed;
    }

    public get maxHealth(): number {
        return this._maxHealth;
    }
    public set maxHealth(maxHealth: number) {
        this._maxHealth = maxHealth;
    }

    public get health(): number {
        return this._health;
    }
    public set health(health: number) {
        if (this.isInvincible) {
            return;
        }

        this._health = MathUtils.clamp(health, 0, this.maxHealth);

        if (this._previousHealth > this._health) {
            this.owner.animation.playIfNotAlready(PlayerAnimations.TAKING_DAMAGE);
        }

        this._previousHealth = this._health;

        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(AAEvents.HEALTH_CHANGE, {
            curhp: this.health,
            maxhp: this.maxHealth,
        });

        // If the health hit 0, change the state of the player
        if (this.health === 0) {
            this.changeState(PlayerStates.DEAD);
        }
    }
}
