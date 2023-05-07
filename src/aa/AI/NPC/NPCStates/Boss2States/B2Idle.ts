import GameEvent from "../../../../../Wolfie2D/Events/GameEvent";
import Receiver from "../../../../../Wolfie2D/Events/Receiver";
import Timer from "../../../../../Wolfie2D/Timing/Timer";
import { AAEvents } from "../../../../AAEvents";
import { EnemyAnimations } from "../../../../Enemy/EnemyController";
import BossState from "../BossState";
import { Boss2States } from "../BossStates";

export default class B2Idle extends BossState {
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

        // if (options.prevState === Boss2States.CHARGE) {
        //     this.idleTimer = new Timer(
        //         2000,
        //         () => {
        //             this.finished(Boss2States.CHARGE);
        //         },
        //         false
        //     );
        // }

        this.idleTimer = new Timer(
            2000,
            () => {
                this.finished(Boss2States.CHARGE);
            },
            false
        );

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
                this.finished(Boss2States.DEAD);
                break;
            }
        }
    }

    public onExit(): Record<string, any> {
        this.idleTimer.reset();
        return {
            dir: this.dir,
            started: true,
            prevState: Boss2States.IDLE,
        };
    }
}
