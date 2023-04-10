import StateMachineAI from "../../Wolfie2D/AI/StateMachineAI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

// import Fall from "./EnemyStates/Fall";
// import Idle from "./EnemyStates/Idle"
// import Jump from "./EnemyStates/Jump";
// import Run from "./EnemyStates/Run";

// import Fireball from "./Fireball";
import Input from "../../Wolfie2D/Input/Input";

import { HW3Controls } from "../HW3Controls";
import HW3AnimatedSprite from "../Nodes/HW3AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { HW3Events } from "../HW3Events";
// import Dead from "./EnemyStates/Dead";
import Receiver from '../../Wolfie2D/Events/Receiver';
import GameEvent from "../../Wolfie2D/Events/GameEvent";
// import {SpellTypes} from "./SpellTypes";

/**
 * Animation keys for the Enemy spritesheet
 */
export const EnemyAnimations = {
    IDLE: "IDLE",
    WALK: "WALK",
    JUMP: "JUMP",
} as const

/**
 * Tween animations the Enemy can Enemy.
 */
export const EnemyTweens = {
    FLIP: "FLIP",
    DEATH: "DEATH"
} as const

/**
 * Keys for the states the EnemyController can be in.
 */
export const EnemyStates = {
    IDLE: "IDLE",
    RUN: "RUN",
	JUMP: "JUMP",
    FALL: "FALL",
    DEAD: "DEAD",
} as const

/**
 * The controller that controls the Enemy.
 */
export default class EnemyController extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    /** Health and max health for the Enemy */
    protected _health: number;
    protected _maxHealth: number;

    /** The Enemys game node */
    protected owner: HW3AnimatedSprite;

    protected _velocity: Vec2;
	protected _speed: number;

    protected tilemap: OrthogonalTilemap;

    protected selectedSpell: string;

    protected receiver: Receiver;
    
    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>){
        this.owner = owner;

        //this.weapon = options.weaponSystem;
        // this.fireParticles = options.fireParticleSystem;
        // this.fireProjectile = options.fireballSystem;
        // this.iceParticles = options.iceParticleSystem;

        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;
        this.speed = 400;
        this.velocity = Vec2.ZERO;

        this.health = 10
        this.maxHealth = 10;

        // Add the different states the Enemy can be in to the EnemyController 
		// this.addState(EnemyStates.IDLE, new Idle(this, this.owner));
		// this.addState(EnemyStates.RUN, new Run(this, this.owner));
        // this.addState(EnemyStates.JUMP, new Jump(this, this.owner));
        // this.addState(EnemyStates.FALL, new Fall(this, this.owner));
        // this.addState(EnemyStates.DEAD, new Dead(this, this.owner));
        
        // Start the Enemy in the Idle state
        this.initialize(EnemyStates.IDLE);

        this.receiver = new Receiver();
    }

    handleEvent(event: GameEvent): void {
        switch(event.type) {
            // Move Enemy on a fireball jump
            // case HW3Events.Enemy_FIRE_JUMP: {
            //     const vel: Vec2 = event.data.get('fireJumpVel');
            //     const EnemyPos: Vec2 = event.data.get('EnemyPos');
            //     const particlePos: Vec2 = event.data.get('particlePos');

            //     // attempt to scale movement vector by difference in position
            //     const posDiff = MathUtils.clamp(EnemyPos.clone().distanceTo(particlePos), 1, 25);
            //     const scaleFactor = MathUtils.clamp(Math.pow(25, 0.8) - 0.7 * Math.pow(posDiff, 0.8), 0, 8);
            //     this.velocity = vel.clone().scale(scaleFactor);
            //     console.log('posDiff: ' + posDiff + ', scaleFactor: ' + scaleFactor);

            //     break;
            // }
            default: {
                throw new Error(`Unhandled event caught in Enemy controller with type ${event.type}`)
            }
        }

    }

    // /** 
	//  * Get the inputs from the keyboard, or Vec2.Zero if nothing is being pressed
	//  */
    // public get inputDir(): Vec2 {
    //     let direction = Vec2.ZERO;
	// 	direction.x = (Input.isPressed(HW3Controls.MOVE_LEFT) ? -1 : 0) + (Input.isPressed(HW3Controls.MOVE_RIGHT) ? 1 : 0);
	// 	direction.y = (Input.isJustPressed(HW3Controls.JUMP) ? -1 : 0);
	// 	return direction;
    // }
    /** 
     * Gets the direction of the mouse from the Enemy's position as a Vec2
     */
    public get faceDir(): Vec2 { return this.owner.position.dirTo(Input.getGlobalMousePosition()); }

    public update(deltaT: number): void {
		super.update(deltaT);

        // TODO not sure if should be before or after super call
        while(this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Update the rotation to apply the particles velocity vector

        // Attack
   
        // Set the selected spell
      

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
        // If the health hit 0, change the state of the Enemy
        if (this.health === 0) { this.changeState(EnemyStates.DEAD); }
    }
}