import Vec2 from "../../../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../../../Wolfie2D/Events/GameEvent";
import Receiver from "../../../../../Wolfie2D/Events/Receiver";
import CanvasNode from "../../../../../Wolfie2D/Nodes/CanvasNode";
import { AAEvents } from "../../../../AAEvents";
import BossState from "../BossState";
import { Boss2States } from "../BossStates";

export default class B2Charge extends BossState {
    private receiver: Receiver;
    protected dir: number;

    public onEnter(options: Record<string, any>): void {
        console.log("ENTERING CHARGE");
        this.owner.animation.play("FLOAT");
        this.parent.speed = this.parent.MAX_SPEED * 0.75;
        this.dir = options.dir;

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.BOSS_KILLED);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        this.lockPlayer(
            this.owner,
            this.owner.getScene().getViewport().getCenter(),
            this.owner.getScene().getViewport().getHalfSize()
        );

        this.parent.velocity.y += this.gravity * deltaT;
        this.parent.velocity.x = this.dir * this.parent.speed;
        this.owner.move(this.parent.velocity.scaled(deltaT));
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.BOSS_KILLED: {
                this.finished(Boss2States.DEAD);
                break;
            }
        }
    }

    protected lockPlayer(player: CanvasNode, viewportCenter: Vec2, viewportHalfSize: Vec2): void {
        const playerLeftEdge = player.position.x - player.size.x / 4;
        const playerRightEdge = player.position.x + player.size.x / 4;
        const viewportLeftEdge = viewportCenter.x - viewportHalfSize.x;
        const viewportRightEdge = viewportCenter.x + viewportHalfSize.x;

        if (playerLeftEdge <= viewportLeftEdge) {
            player.position.x = viewportLeftEdge + player.size.x / 4;
            this.dir = 1;
            this.finished(Boss2States.IDLE);
        } else if (playerRightEdge >= viewportRightEdge) {
            player.position.x = viewportRightEdge - player.size.x / 4;
            this.dir = -1;
            this.finished(Boss2States.IDLE);
        }
    }

    public onExit(): Record<string, any> {
        return {
            dir: this.dir,
            started: true,
            prevState: Boss2States.CHARGE,
        };
    }
}
