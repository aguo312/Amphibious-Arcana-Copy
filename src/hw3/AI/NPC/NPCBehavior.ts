import StateMachineGoapAI from "../../../Wolfie2D/AI/Goap/StateMachineGoapAI";
import NPCActor from "../../Actors/NPCActor";
import NPCAction from "./NPCActions/NPCAction";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";

export default abstract class NPCBehavior extends StateMachineGoapAI<NPCAction> {

    protected override owner: NPCActor;

    public initializeAI(owner: NPCActor, options: Record<string, any>): void {
        this.owner = owner;
        // this.receiver.subscribe();
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

}