import NPCActor from "../../../Actors/NPCActor";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../AAEvents";
import PlayerController from "../../Player/PlayerController";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class ScabberBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.gravity = 4000;
        this.player = options.player;

        this.attackCooldownTimer = new Timer(3000);
    }

    public override update(deltaT: number): void {
        let dir = this.player.position.x > this.owner.position.x ? 1 : -1;

        if (this.owner.position.distanceTo(this.player.position) < 100 && this.attackCooldownTimer.isStopped()) {
            console.log("is ATTACKING PLAYER");
            
            if (dir > 0) {
                this.owner.animation.playIfNotAlready("ATTACKING_RIGHT", false);
            }
            else {
                this.owner.animation.playIfNotAlready("ATTACKING_LEFT", false);
            }
            let x = <PlayerController>this.player.ai;
            x.health -= 1;
            this.attackCooldownTimer.start();
        }
        else if (this.owner.position.distanceTo(this.player.position)) {
            this.owner.animation.playIfNotAlready("IDLE", true);
        }
        else {
            if (!this.owner.animation.isPlaying("ATTACKING_LEFT") || !this.owner.animation.isPlaying("ATTACKING_RIGHT")) {
                // this.owner.animation.playIfNotAlready("IDLE");
                if (dir > 0) {
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", false);
                }
                else {
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", false);
                }
            }
        }

        this.owner._velocity.x = 10*dir;
        this.owner._velocity.y += this.gravity*deltaT;

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}