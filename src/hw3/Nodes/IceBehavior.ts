import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { AAEvents } from "../AAEvents";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Timer from "../../Wolfie2D/Timing/Timer";
import { AAPhysicsGroups } from "../AAPhysicsGroups";

enum IceState {
    EXTENDING,
    RETRACTING
}

export default class IceBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;

    // The start point and direction vector of the Ice
    private src: Vec2;
    private receiver: Receiver;

    protected IceTimer: Timer;


    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        this.src = Vec2.ZERO;
        this.receiver = new Receiver();
        

        this.activate(options);
    }

    public destroy(): void {

    }

    public activate(options: Record<string, any>): void {
        //this.receiver.ignoreEvents();
        this.src.copy(options.src);
        
        // Set the size of the Ice
        this.owner.size = new Vec2(20, 10);
        this.owner.position.copy(this.src)
        // this.owner.addPhysics()
        // this.owner.setGroup(HW3PhysicsGroups.Ice)

    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.CREATE_PLATFORM: {
                this.handleCreatePlatform();
                break;
            }
            
            default: {
                throw new Error("Unhandled event caught in IceBehavior! Event type: " + event.type);
            }
        }
    }

    protected handleCreatePlatform(): void {

    }

    // private resetState(): void {
    //     this.state = IceState.EXTENDING;
    //     this.distanceTraveled = 0;
    //     this.IceActive = true;
    //     this.stopExtending = false;
    // }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }
    
        // Only update the Ice if it's visible and the flag is not set to stop extending
        if (this.owner.visible) {
            
        }
    }
}