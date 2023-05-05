import NPCActor from "../../../Actors/NPCActor";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../AAEvents";
import PlayerController from "../../Player/PlayerController";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class AntBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    protected moveTimer: Timer;

    protected dir: Vec2;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.gravity = 0;
        this.player = options.player;

        this.attackCooldownTimer = new Timer(3000);
        this.moveTimer = new Timer(3000);
        this.dir = Vec2.LEFT;
    }

    public override update(deltaT: number): void {
        const followRange = 200;
        const attackRange = 20;

        const distanceToPlayer = this.owner.position.distanceTo(this.player.position);

        if (distanceToPlayer < attackRange && this.attackCooldownTimer.isStopped()) {
            this.owner.animation.play("ATTACKING", false, AAEvents.PLAYER_HIT);

            this.emitter.fireEvent(GameEventType.PLAY_SOUND, { key: this.owner.getScene().getAttackAudioKey(), loop: false, holdReference: false });
            this.attackCooldownTimer.start();
        } else if (distanceToPlayer < followRange) {
            const playerDir = this.player.position.clone().sub(this.owner.position);
            const speed = 20;
            if (playerDir.x < -5) {
                this.owner._velocity.x = -speed;
            } else if (playerDir.x > 5) {
                this.owner._velocity.x = speed;
            } else {
                this.owner._velocity.x = 0;
            }
            if (playerDir.y < -5) {
                this.owner._velocity.y = -speed;
            } else if (playerDir.y > 5) {
                this.owner._velocity.y = speed;
            } else {
                this.owner._velocity.y = 0;
            }
            if(!this.owner.animation.isPlaying("ATTACKING")){
                this.owner.animation.playIfNotAlready("RUNNING", true);
            }
            this.owner.rotation = -playerDir.angleToCCW(Vec2.UP);

        } else if (this.moveTimer.isStopped()) {
            if(!this.owner.animation.isPlaying("ATTACKING")){
                this.owner.animation.playIfNotAlready("RUNNING", true);
            }        
            if (this.dir.equals(Vec2.RIGHT)) {
                this.dir = Vec2.LEFT;
            } else {
                this.dir = Vec2.RIGHT;       
             }
            this.moveTimer.start();
        }

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}
