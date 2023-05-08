import { EnemyAnimations } from "../../../Enemy/EnemyController";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import { AQStates } from "./BossStates";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import BossState from "./BossState";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import AntParticles from "../AntParticles";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";

export default class AQIdle extends BossState {
    private receiver: Receiver;
    private idleTimer: Timer;
    private weaponSystem: AntParticles;
    protected player: AAAnimatedSprite;
    private dir: number;

    public onEnter(options: Record<string, any>): void {
        console.log("ENTERING IDLE");
        if(!this.owner.animation.isPlaying("ATTACKING") && !this.owner.animation.isPlaying("TAKING_DAMAGE")){
            this.owner.animation.play(EnemyAnimations.IDLE);
        }
        this.parent.speed = this.parent.MIN_SPEED;
        this.player = options.player

        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
        this.dir = options.dir;
        this.weaponSystem = options.weaponSystem;

        if (options.prevState === AQStates.ATTACK) {
            this.idleTimer = new Timer(
                2000,
                () => {
                    this.finished(AQStates.IDLE);
                },
                false
            );
        } else {
            this.idleTimer = new Timer(
                2000,
                () => {
                    this.finished(AQStates.ATTACK);
                },
                false
            );
        }

        if (options.started) {
            this.idleTimer.start();
        }

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.SPAWN_BOSS);
    }

    public update(deltaT: number): void {
        super.update(deltaT);
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        if(!this.owner.animation.isPlaying("ATTACKING") && !this.owner.animation.isPlaying("TAKING_DAMAGE")){
            this.owner.animation.playIfNotAlready(EnemyAnimations.IDLE);
        }
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.SPAWN_BOSS: {
                this.idleTimer.start();
                break;
            }
        }
    }

    public onExit(): Record<string, any> {
        return {
            dir: this.dir,
            started: true,
            player: this.player,
            weaponSystem: this.weaponSystem,
            prevState: AQStates.IDLE,
        };
    }
}
