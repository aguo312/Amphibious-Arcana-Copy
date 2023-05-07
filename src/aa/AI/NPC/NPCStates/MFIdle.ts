import { EnemyAnimations } from "../../../Enemy/EnemyController";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import { MFStates } from "./BossStates";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import BossState from "./BossState";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import MindFlayerParticles from "../MindFlayerParticles";

export default class MFIdle extends BossState {
    private receiver: Receiver;
    private idleTimer: Timer;
    private weaponSystem: MindFlayerParticles;
    private dir: number;

    public onEnter(options: Record<string, any>): void {
        console.log("ENTERING IDLE");
        this.owner.animation.play(EnemyAnimations.IDLE);
        this.parent.speed = this.parent.MIN_SPEED;

        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
        this.dir = options.dir;
        this.weaponSystem = options.weaponSystem;

        if (options.prevState === MFStates.ATTACK) {
            this.idleTimer = new Timer(
                2000,
                () => {
                    this.finished(MFStates.RUN);
                },
                false
            );
        } else {
            this.idleTimer = new Timer(
                2000,
                () => {
                    this.finished(MFStates.ATTACK);
                },
                false
            );
        }

        if (options.started) {
            this.idleTimer.start();
        }

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.SPAWN_BOSS);
        this.receiver.subscribe(AAEvents.BOSS_KILLED);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.SPAWN_BOSS: {
                this.idleTimer.start();
                break;
            }
            case AAEvents.BOSS_KILLED: {
                console.log("handling boss killed");
                this.finished(MFStates.DEAD);
                break;
            }
        }
    }

    public onExit(): Record<string, any> {
        this.idleTimer.reset();
        return {
            dir: this.dir,
            started: true,
            weaponSystem: this.weaponSystem,
            prevState: MFStates.IDLE,
        };
    }
}
