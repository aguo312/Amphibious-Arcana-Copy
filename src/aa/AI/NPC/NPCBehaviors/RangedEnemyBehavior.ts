import NPCActor from "../../../Actors/NPCActor";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../AAEvents";
import PlayerController from "../../Player/PlayerController";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import RangedEnemyParticles from "../RangedEnemyParticles";

export const EnemyStates = {
    IDLE: "IDLE",
} as const;

export default class RangedEnemyBehavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    protected moveTimer: Timer;

    protected runTimer: Timer;

    protected weaponSystem: RangedEnemyParticles;

    protected dir: Vec2;

    protected speed: number;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.gravity = 4000;
        this.player = options.player;
        this.weaponSystem = options.particles;

        this.attackCooldownTimer = new Timer(3000);
        this.moveTimer = new Timer(3000);
        this.runTimer = new Timer(1000);
        this.dir = Vec2.LEFT;
        this.speed = 10;
    }

    public override update(deltaT: number): void {
        let playerDir = this.player.position.x > this.owner.position.x ? 1 : -1;

        /**
         * if player is in attack range 70-125 -> shoot and run away
         * if player is in follow range 175 -> follow
         * if player is out of range -> do normal pace
         */
        if (!this.owner.frozen) {
            // attack if done running away and can attack and player is between 70 and 125 units
            if (
                this.owner.position.distanceTo(this.player.position) >= 70 &&
                this.owner.position.distanceTo(this.player.position) <= 125 &&
                this.runTimer.isStopped() &&
                this.attackCooldownTimer.isStopped()
            ) {
                this.speed = 0;
                let diff = this.player.position.clone().sub(this.owner.position);
                let rotation = diff.angleToCCW(Vec2.RIGHT);
                this.weaponSystem.rotation = rotation;
                if (playerDir > 0) {
                    this.owner.animation.playIfNotAlready("ATTACKING_RIGHT", false);
                    this.weaponSystem.startSystem(1000, 0, this.owner.position);
                } else {
                    this.owner.animation.playIfNotAlready("ATTACKING_LEFT", false);
                    this.weaponSystem.startSystem(1000, 0, this.owner.position);
                }
                this.attackCooldownTimer.start();
            }
            // idle if done attacking and player is between 70 and 125 units
            else if (
                this.owner.position.distanceTo(this.player.position) >= 70 &&
                this.owner.position.distanceTo(this.player.position) <= 125
            ) {
                if (
                    !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                    !this.owner.animation.isPlaying("ATTACKING_RIGHT")
                ) {
                    this.speed = 0;
                    this.owner.animation.playIfNotAlready("IDLE", true);
                }
            }
            // attack if can attack and player is within 70 units
            else if (
                this.owner.position.distanceTo(this.player.position) < 70 &&
                this.attackCooldownTimer.isStopped()
            ) {
                this.speed = 0;
                let diff = this.player.position.clone().sub(this.owner.position);
                let rotation = diff.angleToCCW(Vec2.RIGHT);
                this.weaponSystem.rotation = rotation;
                if (playerDir > 0) {
                    this.owner.animation.playIfNotAlready("ATTACKING_RIGHT", false);
                    this.weaponSystem.startSystem(1000, 0, this.owner.position);
                } else {
                    this.owner.animation.playIfNotAlready("ATTACKING_LEFT", false);
                    this.weaponSystem.startSystem(1000, 0, this.owner.position);
                }
                this.attackCooldownTimer.start();
            }
            // run away for 1 second if can run and player is within 70 units
            else if (
                this.owner.position.distanceTo(this.player.position) < 70 &&
                this.runTimer.isStopped() &&
                !this.attackCooldownTimer.isStopped()
            ) {
                this.speed = 20;
                if (playerDir > 0) {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                } else {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
                this.runTimer.start();
            }
            // chase if player is within 125 - 175 units
            else if (
                this.owner.position.distanceTo(this.player.position) > 125 &&
                this.owner.position.distanceTo(this.player.position) <= 175
            ) {
                this.speed = 10;
                if (playerDir > 0) {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                } else {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                }
            }
            // normal if player is too far away
            else if (
                this.owner.position.distanceTo(this.player.position) > 175 &&
                this.moveTimer.isStopped()
            ) {
                this.speed = 10;
                if (this.dir.equals(Vec2.RIGHT)) {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                } else {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
                this.moveTimer.start();
            }
        }

        this.owner._velocity.x = this.speed * this.dir.x;
        this.owner._velocity.y += this.gravity * deltaT;

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}
