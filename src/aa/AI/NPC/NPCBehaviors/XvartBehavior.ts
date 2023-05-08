import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../AAEvents";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";
import OrthogonalTilemap from "../../../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";

export const EnemyStates = {
    IDLE: "IDLE",
} as const;

export default class XvartBehavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    protected moveTimer: Timer;

    protected tilemap: OrthogonalTilemap;

    protected dir: Vec2;

    protected ownerHealth: number;

    protected damageAnimationTimer: Timer;

    protected prevAnimation: string;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.ownerHealth = this.owner.health;
        this.gravity = 4000;
        this.player = options.player;
        this.tilemap = this.owner.getScene().getTilemap(options.tilemap) as OrthogonalTilemap;

        this.attackCooldownTimer = new Timer(2000);
        this.moveTimer = new Timer(3000);
        this.damageAnimationTimer = new Timer(1000, () => {
            if (this.owner) {
                this.owner.animation.play(this.prevAnimation);
            }
        });
        this.dir = Vec2.LEFT;
        this.speed = 40;
    }

    public override update(deltaT: number): void {
        const playerDir = this.player.position.x > this.owner.position.x ? 1 : -1;
        const faceDir = this.owner._velocity.x > 0 ? 1 : -1;

        if (this.owner.health < this.ownerHealth) {
            this.prevAnimation = this.owner.animation.getCurrent();
            if (faceDir === 1) {
                this.owner.animation.playIfNotAlready("TAKING_DAMAGE_RIGHT");
            } else {
                this.owner.animation.playIfNotAlready("TAKING_DAMAGE_LEFT");
            }

            this.ownerHealth = this.owner.health;
            this.damageAnimationTimer.start();
        }

        /** if player is in attack range 20 -> attack
         *  if player is in follow range 50 -> follow
         *  if player is out of range -> do normal pace
         */
        if (!this.owner.frozen && this.damageAnimationTimer.isStopped()) {
            if (
                this.owner.position.distanceTo(this.player.position) < 40 &&
                this.attackCooldownTimer.isStopped()
            ) {
                if (playerDir > 0) {
                    this.owner.animation.playIfNotAlready(
                        "ATTACKING_RIGHT",
                        false,
                        AAEvents.PLAYER_HIT
                    );
                } else {
                    this.owner.animation.playIfNotAlready(
                        "ATTACKING_LEFT",
                        false,
                        AAEvents.PLAYER_HIT
                    );
                }
                this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
                    key: this.owner.getScene().getAttackAudioKey(),
                    loop: false,
                    holdReference: false,
                });
                this.attackCooldownTimer.start();
            } else if (this.owner.position.distanceTo(this.player.position) < 20) {
                if (
                    !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                    !this.owner.animation.isPlaying("ATTACKING_RIGHT")
                ) {
                    this.owner.animation.playIfNotAlready("IDLE", true);
                }
            } else if (
                this.owner.position.distanceTo(this.player.position) < 200 &&
                !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                !this.owner.animation.isPlaying("ATTACKING_RIGHT")
            ) {
                this.speed = 40;
                if (playerDir > 0) {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                } else {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                }
            } else if (
                this.moveTimer.isStopped() &&
                !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                !this.owner.animation.isPlaying("ATTACKING_RIGHT")
            ) {
                this.speed = 40;
                if (this.dir.equals(Vec2.RIGHT)) {
                    this.dir = Vec2.LEFT;
                    this.owner.animation.playIfNotAlready("MOVING_LEFT", true);
                } else {
                    this.dir = Vec2.RIGHT;
                    this.owner.animation.playIfNotAlready("MOVING_RIGHT", true);
                }
                this.moveTimer.start();
            }
            // if will fall off then don't move
            if (this.dir.equals(Vec2.RIGHT)) {
                if (
                    this.tilemap.getTileAtRowCol(
                        new Vec2(
                            Math.floor(this.owner.position.x / 16) + 1,
                            Math.floor(this.owner.position.y / 16) + 1
                        )
                    ) == 0
                ) {
                    this.speed = 0;
                    if (
                        !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                        !this.owner.animation.isPlaying("ATTACKING_RIGHT")
                    ) {
                        this.owner.animation.playIfNotAlready("IDLE", true);
                    }
                }
            } else {
                if (
                    this.tilemap.getTileAtRowCol(
                        new Vec2(
                            Math.floor(this.owner.position.x / 16) - 1,
                            Math.floor(this.owner.position.y / 16) + 1
                        )
                    ) == 0
                ) {
                    this.speed = 0;
                    if (
                        !this.owner.animation.isPlaying("ATTACKING_LEFT") &&
                        !this.owner.animation.isPlaying("ATTACKING_RIGHT")
                    ) {
                        this.owner.animation.playIfNotAlready("IDLE", true);
                    }
                }
            }
        }

        this.owner._velocity.x = this.speed * this.dir.x;
        this.owner._velocity.y += this.gravity * deltaT;

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}
