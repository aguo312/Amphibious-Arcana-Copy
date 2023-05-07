import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import MindFlayerParticles from "../MindFlayerParticles";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import MFRun from "../NPCStates/MFRun";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import { MFStates } from "../NPCStates/BossStates";
import MFIdle from "../NPCStates/MFIdle";

export const EnemyStates = {
    IDLE: "IDLE",
} as const;

export default class MindFlayerBehavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;

    protected player: AAAnimatedSprite;

    protected gravity: number;

    protected attackCooldownTimer: Timer;
    protected moveTimer: Timer;
    protected iFramesTimer: Timer;

    protected weaponSystem: MindFlayerParticles;

    protected started: boolean;

    protected receiver: Receiver;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.started = false;
        this.owner = owner;
        this.gravity = 4000;
        this.player = options.player;
        this.weaponSystem = options.particles;

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.SPAWN_BOSS);

        // this.attackCooldownTimer = new Timer(3000);
        // this.attackCooldownTimer.start();

        // this.moveTimer = new Timer(10000);
        // this.moveTimer.start();

        // this.iFramesTimer = new Timer(1000);
        // this.iFramesTimer.start();

        // Add all states
        this.addState(MFStates.IDLE, new MFIdle(this, this.owner));
        // this.addState(BossStates.RUN_LEFT, new RunLeft(this, this.owner));
        this.addState(MFStates.RUN, new MFRun(this, this.owner));

        // Set the start state
        this.initialize(MFStates.IDLE, { dir: -1 });
    }

    /**
     * Could have MoveLeftAction, MoveRightAction, AttackAction
     */
    public override update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (!this.started) {
            return;
        }
    }

    // public override update(deltaT: number): void {
    //     // Handle all game events
    //     while (this.receiver.hasNextEvent()) {
    //         this.handleEvent(this.receiver.getNextEvent());
    //     }

    //     if (!this.started || this.owner.animation.isPlaying("TAKING_DAMAGE")) {
    //         return;
    //     }

    //     // Move across the screen
    //     if (this.moveTimer.isStopped()) {
    //         this.moveTimer.start();
    //     }

    //     const dir = this.player.position.x > this.owner.position.x ? 1 : -1;

    //     // Attack in the player's direction
    //     if (this.attackCooldownTimer.isStopped()) {
    //         this.owner.invertX = dir === 1 ? true : false;
    //         this.owner.animation.playIfNotAlready("CASTING_LEFT", false);

    //         this.weaponSystem.setDir(dir);
    //         this.weaponSystem.startSystem(1000, 0, this.owner.position);
    //         this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
    //             key: this.owner.getScene().getAttackAudioKey(),
    //             loop: false,
    //             holdReference: false,
    //         });

    //         this.attackCooldownTimer.start();
    //     } else {
    //         // Otherwise just chill
    //         if (!this.owner.animation.isPlaying("CASTING_LEFT")) {
    //             this.owner.animation.playIfNotAlready("IDLE");
    //         }
    //     }

    //     this.owner._velocity.x = 5 * dir;
    //     this.owner._velocity.y += this.gravity * deltaT;

    //     this.owner.move(this.owner._velocity.scaled(deltaT));
    // }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.SPAWN_BOSS: {
                this.started = true;
                break;
            }
        }
    }
}
