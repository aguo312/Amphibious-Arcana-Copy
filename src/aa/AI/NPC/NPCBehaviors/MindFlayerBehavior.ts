import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import Timer from "../../../../Wolfie2D/Timing/Timer";
import MindFlayerParticles from "../MindFlayerParticles";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import MFRun from "../NPCStates/MFRun";
import { MFStates } from "../NPCStates/BossStates";
import MFIdle from "../NPCStates/MFIdle";
import MFAttack from "../NPCStates/MFAttack";
import MFDead from "../NPCStates/MFDead";

export default class MindFlayerBehavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;
    protected player: AAAnimatedSprite;
    protected weaponSystem: MindFlayerParticles;
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
        this.receiver.subscribe(AAEvents.BOSS_KILLED);

        // Add all states
        this.addState(MFStates.IDLE, new MFIdle(this, this.owner));
        this.addState(MFStates.RUN, new MFRun(this, this.owner));
        this.addState(MFStates.ATTACK, new MFAttack(this, this.owner));
        this.addState(MFStates.DEAD, new MFDead(this, this.owner));

        // Set the start state
        this.initialize(MFStates.IDLE, { dir: -1, weaponSystem: this.weaponSystem });
    }

    public override update(deltaT: number): void {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
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
            case AAEvents.BOSS_KILLED: {
                this.weaponSystem.stopSystem();
                break;
            }
        }
    }
}
