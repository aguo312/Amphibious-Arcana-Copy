import NPCActor from "../../../Actors/NPCActor";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import MindFlayerParticles from "../MindFlayerParticles";

export const EnemyStates = {
    IDLE: "IDLE"
} as const;

export default class MindFlayerBehavior extends NPCBehavior {

    /** The GameNode that owns this NPCGoapAI */
    protected override owner: NPCActor;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;

    protected weaponSystem: MindFlayerParticles;
    
    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.owner = owner;
        this.gravity = 4000;
        this.player = options.player;
        this.weaponSystem = options.particles;

        this.attackCooldownTimer = new Timer(3000);
        this.attackCooldownTimer.start();
    }

    public override update(deltaT: number): void {
        let dir = this.player.position.x > this.owner.position.x ? 1 : -1;

        if (this.owner.position.distanceTo(this.player.position) < 100 && this.attackCooldownTimer.isStopped()) {
            // Attack player if within reasonable distance
            this.owner.invertX = dir === 1 ? true : false;
            this.owner.animation.playIfNotAlready("CASTING_LEFT", false);

            this.weaponSystem.setDir(dir);
            this.weaponSystem.startSystem(1000, 0, this.owner.position);

            console.log('starting timer');
            this.attackCooldownTimer.start();
        } else {
            // Otherwise just chill
            if (!this.owner.animation.isPlaying("CASTING_LEFT")) {
                this.owner.animation.playIfNotAlready("IDLE");
            }
        }

        this.owner._velocity.x = 5*dir;
        this.owner._velocity.y += this.gravity*deltaT;

        this.owner.move(this.owner._velocity.scaled(deltaT));
    }
}