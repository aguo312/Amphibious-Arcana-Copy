import { EnemyAnimations } from "../../../Enemy/EnemyController";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import { MFStates } from "./BossStates";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import BossState from "./BossState";
import Timer from "../../../../Wolfie2D/Timing/Timer";

export default class MFIdle extends BossState {
    private receiver: Receiver;
    private idleTimer: Timer;
    private dir: number;

    public onEnter(options: Record<string, any>): void {
        console.log("ENTERING IDLE");
        this.owner.animation.play(EnemyAnimations.IDLE);
        this.parent.speed = this.parent.MIN_SPEED;

        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
        this.dir = options.dir;

        this.idleTimer = new Timer(
            4000,
            () => {
                this.finished(MFStates.RUN);
            },
            false
        );

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
        };
    }
}
