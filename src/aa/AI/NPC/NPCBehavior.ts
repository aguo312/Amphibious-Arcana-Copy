import NPCActor from "../../Actors/NPCActor";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import StateMachineAI from "../../../Wolfie2D/AI/StateMachineAI";
import { AAEvents } from "../../AAEvents";
import MathUtils from "../../../Wolfie2D/Utils/MathUtils";
import { MFStates } from "./NPCStates/BossStates";

export default abstract class NPCBehavior extends StateMachineAI {
    public readonly MAX_SPEED: number = 200;
    public readonly MIN_SPEED: number = 100;

    protected override owner: NPCActor;
    // protected gravity: number;

    protected _velocity: Vec2;
    protected _speed: number;
    protected _health: number;
    protected _maxHealth: number;

    public initializeAI(owner: NPCActor, options: Record<string, any>): void {
        this.owner = owner;
        this.velocity = Vec2.ZERO;
    }

    public activate(options: Record<string, any>): void {}

    public update(deltaT: number): void {
        super.update(deltaT);
    }

    /**
     * @param event the game event
     */
    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            default: {
                super.handleEvent(event);
                break;
            }
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
        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(AAEvents.HEALTH_CHANGE, {
            curhp: this.health,
            maxhp: this.maxHealth,
        });
    }

    public get health(): number {
        return this._health;
    }
    public set health(health: number) {
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        // When the health changes, fire an event up to the scene.
        this.emitter.fireEvent(AAEvents.HEALTH_CHANGE, {
            curhp: this.health,
            maxhp: this.maxHealth,
        });
        // If the health hit 0, change the state of the player
        if (this.health === 0) {
            this.changeState(MFStates.DEAD);
        }
    }
}
