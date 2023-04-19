import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import { AAEvents } from "../AAEvents";
import AALevel from "../Scenes/AALevel";

/**
 * An animated sprite in the HW3Level. I have extended the animated sprite to create a more specific sprite
 * with a reference to a HW3Level. One of the things I want to try and show all of you is how to extend
 * Wolfie2d. 
 * 
 * For the HW3AnimatedSprite, I've just overriden the type of the scene and the associated getter/setter
 * methods. Without this, you would have to explicitly cast the type of the scene to a HW3Level to get access
 * to the methods associated with HW3Level. 
 * 
 * - Peter
 */
export default class AAAnimatedSprite extends AnimatedSprite {

    protected scene: AALevel;
    protected _health: number;
    protected max_health: number;
    
    public setScene(scene: AALevel): void { this.scene = scene; }
    public getScene(): AALevel { return this.scene; }

    public get maxHealth(): number { return this.max_health; }
    public set maxHealth(health: number) { this.max_health = health; }
    
    public get health(): number { return this._health; }
    public set health(health: number) {
        this._health = MathUtils.clamp(health, 0, this.maxHealth);
        // this.emitter.fireEvent(AAEvents.ENEMY_HEALTH_CHANGE, {id: this.id, curhp: this.health, maxhp: this.maxHealth});
        if (this._health === 0) {
            this.tweens.play("DEATH");
            // this.emitter.fireEvent(AAEvents.NPC_KILLED, {node: this.id});
        }
    }

}