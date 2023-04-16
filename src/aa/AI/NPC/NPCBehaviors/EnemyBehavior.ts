import StateMachineAI from "../../../../Wolfie2D/AI/StateMachineAI";
import NPCActor from "../../../Actors/NPCActor";
import HW3AnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import GoalReached from '../NPCStatuses/FalseStatus';
import PaceAction from "../NPCActions/PaceAction";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class EnemyBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;
    
    private readonly X_VEL: number = 25;

    public initializeAI(owner: HW3AnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        console.log('EnemyBehavior this.owner', this.owner);

        // Add the goal status
        this.addStatus("goal", new GoalReached());

        // Add the pace action
        let pace = new PaceAction(this, this.owner);
        pace.addEffect("goal");
        pace.cost = 100;
        this.addState("PACE", pace);

        this.goal = "goal";

        this.initialize();
    }

    public override update(deltaT: number): void {
        super.update(deltaT);
        
        // This doesn't work without this, I have no idea why
        this.currentState.update(deltaT);
    }
}