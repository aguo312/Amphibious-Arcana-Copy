import NPCActor from "../../../Actors/NPCActor";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../AAEvents";
import PlayerController from "../../Player/PlayerController";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class ScabberBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    protected moveTimer: Timer;

    protected dir: Vec2;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.gravity = 4000;
        this.player = options.player;

        this.attackCooldownTimer = new Timer(3000);
        this.moveTimer = new Timer(3000);
        this.dir = Vec2.LEFT;
    }

    public override update(deltaT: number): void {
        let playerDir = this.player.position.x > this.owner.position.x ? 1 : -1;

        /** if player is in attack range 20 -> attack
         *  if player is in follow range 50 -> follow
         *  if player is out of range -> do normal pace
         */
        if (!this.owner.frozen) {
            if (this.owner.position.distanceTo(this.player.position) < 20 && this.attackCooldownTimer.isStopped()) {
                if (playerDir > 0) {
                    this.owner.animation.playIfNotAlready("ATTACKING_RIGHT", false, AAEvents.PLAYER_HIT);
                }
                else {
                    this.owner.animation.playIfNotAlready("ATTACKING_LEFT", false, AAEvents.PLAYER_HIT);
                }
                this.attackCooldownTimer.start();
            }
            else if (this.owner.position.distanceTo(this.player.position) < 20) {
                if (!this.owner.animation.isPlaying("ATTACKING_LEFT") && !this.owner.animation.isPlaying("ATTACKING_RIGHT")) {
                    this.owner.animation.playIfNotAlready("IDLE", true);
                }
            }
            else if (this.owner.position.distanceTo(this.player.position) < 50) {
                if (playerDir > 0) {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
                else {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                }
            }
            else if (this.moveTimer.isStopped()) {
                if (this.dir.equals(Vec2.RIGHT)) {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                }
                else {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
                this.moveTimer.start();
            }
        }

        this.owner._velocity.x = 10*this.dir.x;
        this.owner._velocity.y += this.gravity*deltaT;

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}