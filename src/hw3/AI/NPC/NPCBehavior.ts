import StateMachineGoapAI from "../../../Wolfie2D/AI/Goap/StateMachineGoapAI";
import NPCActor from "../../Actors/NPCActor";
import NPCAction from "./NPCActions/NPCAction";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";

export default abstract class NPCBehavior extends StateMachineGoapAI<NPCAction> {

    protected override owner: NPCActor;
    protected gravity: number;
    protected velocity: Vec2

    public initializeAI(owner: NPCActor, options: Record<string, any>): void {
        this.owner = owner;

        this.velocity = new Vec2(0, 0);
        this.gravity = 500;
        // this.receiver.subscribe();
    } 

    public activate(options: Record<string, any>): void {}

    public update(deltaT: number): void {
        super.update(deltaT);

        this.velocity.y += this.gravity*deltaT;
        this.owner.move(this.velocity.scaled(deltaT));
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

}