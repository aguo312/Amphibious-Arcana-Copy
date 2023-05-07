import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../../AAEvents";
import Receiver from "../../../../Wolfie2D/Events/Receiver";
import { Boss2States } from "../NPCStates/BossStates";
import B2Charge from "../NPCStates/Boss2States/B2Charge";
import B2Dead from "../NPCStates/Boss2States/B2Dead";
import B2Idle from "../NPCStates/Boss2States/B2Idle";

export default class Boss2Behavior extends NPCBehavior {
    /** The GameNode that owns this NPCGoapAI */
    protected override owner: AAAnimatedSprite;
    protected player: AAAnimatedSprite;
    protected started: boolean;
    protected receiver: Receiver;

    public initializeAI(owner: AAAnimatedSprite, options: Record<string, any>): void {
        super.initializeAI(owner, options);
        this.started = false;
        this.owner = owner;
        this.player = options.player;

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.SPAWN_BOSS);
        this.receiver.subscribe(AAEvents.BOSS_KILLED);

        // Add all states
        this.addState(Boss2States.IDLE, new B2Idle(this, this.owner));
        this.addState(Boss2States.CHARGE, new B2Charge(this, this.owner));
        this.addState(Boss2States.DEAD, new B2Dead(this, this.owner));

        this.initialize(Boss2States.IDLE, { dir: -1 });
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
                break;
            }
        }
    }
}
