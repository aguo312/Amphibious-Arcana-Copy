import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import GameNode from "../../../../Wolfie2D/Nodes/GameNode";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import NPCActor from "../../../Actors/NPCActor";
import { TargetableEntity } from "../../../GameSystems/Targeting/TargetableEntity";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import NPCAction from "./NPCAction";

export default class PaceAction extends NPCAction {

    protected moveTimer: Timer;
    protected dir: Vec2;
    protected owner: AAAnimatedSprite;
    protected animation: string;

    public constructor(parent: NPCBehavior, actor: NPCActor) {
        super(parent, actor);
        this.owner = actor as AAAnimatedSprite;
    }

    public onEnter(options: Record<string, any>): void {
        this.dir = Vec2.RIGHT;
        this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);

        this.moveTimer = new Timer(2000, () => {
            if (!this.owner.frozen){
                if (this.dir.equals(Vec2.RIGHT)) {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                } else {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
            }
        }, true);

        this.moveTimer.start();
    }

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

    public update(deltaT: number) {
        this.owner._velocity.x = this.dir.x / 2;
    }
}