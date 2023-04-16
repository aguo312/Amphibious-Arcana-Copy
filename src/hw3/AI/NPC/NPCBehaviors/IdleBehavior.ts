import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import NPCActor from "../../../Actors/NPCActor";
import HW3AnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import GoalReached from '../NPCStatuses/FalseStatus';
import IdleAction from "../NPCActions/IdleAction";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class IdleBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;

    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>): void {
        // this.owner = owner;
        super.initializeAI(owner, options);

        // Add the goal status
        this.addStatus("goal", new GoalReached());

        // Add the idle action
        let idle = new IdleAction(this, this.owner);
        idle.addEffect("goal");
        idle.cost = 100;
        this.addState("IDLE", idle);

        // Set the goal to idle
        this.goal = "goal";

        // Add gravity
        

        this.initialize();
    }

    public override update(deltaT: number): void {
        super.update(deltaT);
    }
}