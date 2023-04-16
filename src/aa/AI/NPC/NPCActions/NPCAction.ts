import GoapAction from "../../../../Wolfie2D/AI/Goap/GoapAction";
import NPCActor from "../../../Actors/NPCActor";
import NPCBehavior from "../NPCBehavior";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";

export default abstract class NPCAction extends GoapAction {

    protected parent: NPCBehavior;
    protected actor: NPCActor;

    public constructor(parent: NPCBehavior, actor: NPCActor) {
        super(parent, actor);
    }

    public onEnter(options: Record<string, any>): void {

    }

    public update(deltaT: number): void {

    }

    public abstract performAction(target: TargetableEntity): void;

    public onExit(): Record<string, any> {
        return {};
    }

    public handleInput(event: GameEvent): void {
        switch (event.type) {
            default: {
                throw new Error(`Unhandled event caugh in NPCAction: ${event.type}`);
            }
        }
    }

}