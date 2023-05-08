import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import { AQStates } from "../NPCStates/BossStates";
import AntParticles from "../AntParticles";
import AQIdle from "../NPCStates/AQIdle";
import AQAttack from "../NPCStates/AQAttack";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";

export default class AntQueenBehavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;
    protected player: AAAnimatedSprite;
    protected weaponSystem: AntParticles;
    protected started: boolean;
    protected receiver: Receiver;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.started = false;
        this.owner = owner;
        this.player = options.player;
        this.weaponSystem = options.particles;

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.SPAWN_BOSS);

        // Add all states
        this.addState(AQStates.IDLE, new AQIdle(this, this.owner));
        //this.addState(MFStates.RUN, new MFRun(this, this.owner));
        this.addState(AQStates.ATTACK, new AQAttack(this, this.owner));

        // Set the start state
        this.initialize(AQStates.IDLE, {
            dir: -1,
            weaponSystem: this.weaponSystem,
            player: this.player,
        });
    }

    public override update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
        const playerDir = this.player.position.clone().sub(this.owner.position);
        this.owner.rotation = -playerDir.angleToCCW(Vec2.UP);

        if (this.owner.getScene().bossDead) {
            this.setActive(false);
        }

        if (!this.started) {
            return;
        }
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.SPAWN_BOSS: {
                this.started = true;
                break;
            }
        }
    }
}
