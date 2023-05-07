import BossState from "./BossState";
import { MFStates } from "./BossStates";
import CanvasNode from "../../../../Wolfie2D/Nodes/CanvasNode";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";
import MindFlayerParticles from "../MindFlayerParticles";

export default class Run extends BossState {
    protected dir: number;
    protected weaponSystem: MindFlayerParticles;

    public onEnter(options: Record<string, any>): void {
        console.log("ENTERING RUN");
        this.owner.animation.play("MOVING_LEFT");
        this.parent.speed = this.parent.MAX_SPEED;
        this.dir = options.dir;
        this.weaponSystem = options.weaponSystem;
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        this.lockPlayer(
            this.owner,
            this.owner.getScene().getViewport().getCenter(),
            this.owner.getScene().getViewport().getHalfSize()
        );

        this.parent.velocity.y += this.gravity * deltaT;
        this.parent.velocity.x = this.dir * this.parent.speed;
        this.owner.move(this.parent.velocity.scaled(deltaT));
    }

    protected lockPlayer(player: CanvasNode, viewportCenter: Vec2, viewportHalfSize: Vec2): void {
        const playerLeftEdge = player.position.x - player.size.x / 4;
        const playerRightEdge = player.position.x + player.size.x / 4;
        const viewportLeftEdge = viewportCenter.x - viewportHalfSize.x;
        const viewportRightEdge = viewportCenter.x + viewportHalfSize.x;

        if (playerLeftEdge <= viewportLeftEdge) {
            player.position.x = viewportLeftEdge + player.size.x / 4;
            this.dir = 1;
            this.finished(MFStates.IDLE);
        } else if (playerRightEdge >= viewportRightEdge) {
            player.position.x = viewportRightEdge - player.size.x / 4;
            this.dir = -1;
            this.finished(MFStates.IDLE);
        }
    }

    public onExit(): Record<string, any> {
        return {
            dir: this.dir,
            started: true,
            weaponSystem: this.weaponSystem,
            prevState: MFStates.RUN,
        };
    }
}
