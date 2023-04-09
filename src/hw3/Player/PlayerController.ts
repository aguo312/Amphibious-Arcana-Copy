import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

import Fall from "./PlayerStates/Fall";
import Idle from "./PlayerStates/Idle";
import Jump from "./PlayerStates/Jump";
import Run from "./PlayerStates/Run";

import Fireball from "./Fireball";
import Input from "../../Wolfie2D/Input/Input";

import { HW3Controls } from "../HW3Controls";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { HW3Events } from "../HW3Events";
import Dead from "./PlayerStates/Dead";
import Receiver from '../../Wolfie2D/Events/Receiver';
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import {SpellTypes} from "./SpellTypes";
import IceParticles from "./IceParticles";

/**
 * Animation keys for the player spritesheet
 */
export const PlayerAnimations = {
    IDLE: "IDLE",
    WALK: "WALK",
    JUMP: "JUMP",
} as const

/**
 * Tween animations the player can player.
 */
export const PlayerTweens = {
    FLIP: "FLIP",
    DEATH: "DEATH"
} as const

/**
 * Keys for the states the PlayerController can be in.
 */
export const PlayerStates = {
    IDLE: "IDLE",
    RUN: "RUN",
	JUMP: "JUMP",
    FALL: "FALL",
    DEAD: "DEAD",
} as const

/**
 * The controller that controls the player.
 */
export default class PlayerController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    /** Health and max health for the player */
    protected _health: number;
    protected _maxHealth: number;

    /** The players game node */
    protected owner: HW3AnimatedSprite;

    protected _velocity: Vec2;
	protected _speed: number;

    protected tilemap: OrthogonalTilemap;
    // protected cannon: Sprite;
    //protected weapon: Fireball;
    protected fireParticles: Fireball;
    protected fireProjectile: Fireball;

    protected iceParticles: IceParticles;

    protected selectedSpell: string;

    protected receiver: Receiver;
    
    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>){
        this.owner = owner;

        //this.weapon = options.weaponSystem;
        this.fireParticles = options.fireParticleSystem;
        this.fireProjectile = options.fireballSystem;
        this.iceParticles = options.iceParticleSystem;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 10
        this.maxHealth = 10;

        // Add the different states the player can be in to the PlayerController 
		this.addState(PlayerStates.IDLE, new Idle(this, this.owner));
		this.addState(PlayerStates.RUN, new Run(this, this.owner));
        this.addState(PlayerStates.JUMP, new Jump(this, this.owner));
        this.addState(PlayerStates.FALL, new Fall(this, this.owner));
        this.addState(PlayerStates.DEAD, new Dead(this, this.owner));
        
        // Start the player in the Idle state
        this.initialize(PlayerStates.IDLE);

        this.selectedSpell = SpellTypes.TONGUE;

        this.receiver = new Receiver();
        this.receiver.subscribe(HW3Events.PLAYER_FIRE_JUMP);
    }

    handleEvent(event: GameEvent): void {
        switch(event.type) {
            // Move player on a fireball jump
            case HW3Events.PLAYER_FIRE_JUMP: {
                const vel: Vec2 = event.data.get('fireJumpVel');
                const playerPos: Vec2 = event.data.get('playerPos');
                const particlePos: Vec2 = event.data.get('particlePos');

                // attempt to scale movement vector by difference in position
                const posDiff = MathUtils.clamp(playerPos.clone().distanceTo(particlePos), 1, 100);
                this.velocity = vel.clone().scale((1/posDiff) * 50);
                console.log(posDiff);

                break;
            }
            default: {
                throw new Error(`Unhandled event caught in player controller with type ${event.type}`)
            }
        }

    }

    /** 
	 * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	 */
    public get inputDir(): Vec2 {
        let direction = Vec2.ZERO;
		direction.x = (Input.isPressed(HW3Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW3Controls.MOVE_RIGHT) ? 1 : 0);
		direction.y = (Input.isJustPressed(HW3Controls.JUMP) ? -1 : 0);
		return direction;
    }
    /** 
     * Gets the direction of the mouse from the player's position as a Vec2
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    public update(deltaT: number): void {
		super.update(deltaT);

        // TODO not sure if should be before or after super call
        while(this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update the rotation to apply the particles velocity vector
        //this.fireParticles.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
        this.fireProjectile.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
        this.iceParticles.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;

        // Attack
        if (Input.isMousePressed()) {
            //this.tilemap.setTileAtRowCol(this.tilemap.getColRowAt(Input.getGlobalMousePosition()),5);

            switch(this.selectedSpell) {
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
                    throw new Error(`Unhandled attack type ${this.selectedSpell} caught in handlePlayerAttack()`);
                }
            }
            this.emitter.fireEvent(HW3Events.PLAYER_ATTACK);
        }

        // Set the selected spell
        if (Input.isPressed(HW3Controls.SELECT_TONGUE)) {
            this.selectedSpell = SpellTypes.TONGUE;
            this.emitter.fireEvent(HW3Events.SELECT_TONGUE);
        }
        if (Input.isPressed(HW3Controls.SELECT_FIREBALL)) {
            this.selectedSpell = SpellTypes.FIREBALL;
            this.emitter.fireEvent(HW3Events.SELECT_FIREBALL);
        }
        if (Input.isPressed(HW3Controls.SELECT_ICE)) {
            this.selectedSpell = SpellTypes.ICE;
            this.emitter.fireEvent(HW3Events.SELECT_ICE);
        }

	}

    protected tongueAttack(): void {
        this.emitter.fireEvent(HW3Events.SHOOT_TONGUE, { pos: this.owner.position, dir: this.faceDir });
    }

    protected fireballAttack(): void {
        // If the player hits the attack button and the weapon system isn't running, restart the system and fire!
        if (!this.fireProjectile.isSystemRunning() && !this.fireParticles.isSystemRunning()) {
            // Update the rotation to apply the particles velocity vector
            this.fireProjectile.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.fireProjectile.startSystem(500, 0, this.owner.position);
        }
    }

    protected iceAttack(): void {
        if (!this.iceParticles.isSystemRunning()) {
            // Update the rotation to apply the particles velocity vector
            this.iceParticles.rotation = 2*Math.PI - Vec2.UP.angleToCCW(this.faceDir) + Math.PI;
            // Start the particle system at the player's current position
            this.iceParticles.startSystem(500, 0, this.owner.position);
        }
    }

    public get velocity(): Vec2 { return this._velocity; }
    public set velocity(velocity: Vec2) { this._velocity = velocity; }

    public get speed(): number { return this._speed; }
    public set speed(speed: number) { this._speed = speed; }

    public get maxHealth(): number { return this._maxHealth; }
    public set maxHealth(maxHealth: number) { this._maxHealth = maxHealth; }

    public get health(): number { return this._health; }
    public set health(health: number) { 
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(HW3Events.HEALTH_CHANGE, {curhp: this.health, maxhp: this.maxHealth});
        // If the health hit 0, change the state of the player
        if (this.health === 0) { this.changeState(PlayerStates.DEAD); }
    }
}