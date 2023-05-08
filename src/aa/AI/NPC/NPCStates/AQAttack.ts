import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import { AQStates } from "./BossStates";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import BossState from "./BossState";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import { GameEventType } from "../../../../Wolfie2D/Events/GameEventType";
import AntParticles from "../AntParticles";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";

export default class AQAttack extends BossState {
    private receiver: Receiver;
    private idleTimer: Timer;
    private weaponSystem: AntParticles;
    protected player: AAAnimatedSprite;

    private dir: number;

    public onEnter(options: Record<string, any>): void {
        this.parent.speed = this.parent.MIN_SPEED;

        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
        this.dir = options.dir;
        this.weaponSystem = options.weaponSystem;
        this.player = options.player;
        this.attack();
        this.finished(AQStates.IDLE);
    }

    public update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    }

    private attack(): void {
        if (this.owner.getScene().bossDead) {
            console.log("boss dead");
            return;
        }

        let diff = this.player.position.clone().sub(this.owner.position);
        let rotation = diff.angleToCCW(Vec2.DOWN);

        this.weaponSystem.rotation = rotation;

        this.owner.animation.playIfNotAlready("ATTACKING", false);
        this.weaponSystem.startSystem(1000, 0, this.owner.position);

        this.emitter.fireEvent(GameEventType.PLAY_SOUND, {
            key: this.owner.getScene().getAttackAudioKey(),
            loop: false,
            holdReference: false,
        });
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.SPAWN_BOSS: {
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
            prevState: AQStates.ATTACK,
        };
    }
}
