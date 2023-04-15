import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import NPCAction from "./NPCAction";

export default class IdleAction extends NPCAction {

    public performAction(target: TargetableEntity): void {
        this.finished();
    }

    public handleInput(event: GameEvent): void {
        switch (event.type) {
            default: {
                super.handleInput(event);
                break;
            }
        }
    }
}