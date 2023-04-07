import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { HW3Events } from "../HW3Events";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Timer from "../../Wolfie2D/Timing/Timer";

export default class TongueBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;

    // The start point and direction vector of the tongue
    private src: Vec2;
    private dir: Vec2;

    // The current horizontal and vertical speed of the tongue
    private currentXSpeed: number;
    private currentYSpeed: number;

    // How much to increase the speed of the tongue by each frame
    private xSpeedIncrement: number;
    private ySpeedIncrement: number;

    // Upper and lower bounds on the horizontal speed of the tongue
    private minXSpeed: number;
    private maxXSpeed: number;

    // Upper and lower bounds on the vertical speed of the tongue
    private minYSpeed: number;
    private maxYSpeed: number;

    private receiver: Receiver;

    protected tongueTimer: Timer;

    private tongueTipAABB: AABB;

    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;

        this.src = Vec2.ZERO;
        this.dir = Vec2.ZERO;

        this.currentXSpeed = 50;
        this.xSpeedIncrement = 0;
        this.minXSpeed = 50;
        this.maxXSpeed = 50;

        this.currentYSpeed = 50;
        this.ySpeedIncrement = 0;
        this.minYSpeed = 50;
        this.maxYSpeed = 50;

        this.receiver = new Receiver();
        this.receiver.subscribe(HW3Events.TONGUE_WALL_COLLISION);
        this.receiver.subscribe(HW3Events.PLAYER_POS_UPDATE);
        
        this.activate(options);
    }

    public destroy(): void {

    }

    public activate(options: Record<string, any>): void {
        //this.receiver.ignoreEvents();
        this.src.copy(options.src);
        this.dir.copy(options.dir);

        // Set the size of the tongue
        this.owner.size = new Vec2(5, 100);

        // Set the position of the tongue
        this.owner.position = this.src.clone().add(this.owner.size);
        this.owner.rotation = Vec2.RIGHT.angleToCCW(this.dir) - Math.PI/2;

        // Calculate the position of the tongue tip
        const tongueBase = this.src.clone().add(this.dir.normalized().scale(this.owner.size.y * 0.5));
        this.owner.position.copy(tongueBase);

        // Calculate the position of the tongue tip
        const tongueTip = tongueBase.clone().add(this.dir.normalized().scale(this.owner.size.y));
        this.tongueTipAABB = new AABB(tongueTip, new Vec2(5, 5)); // Set the AABB size as you see fit

        // Set the collision shape of the tongue - these values are probably wrong
        // TODO Make AABB just the tip of the tongue so rotation doesn't matter?


    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case HW3Events.TONGUE_WALL_COLLISION: {
                this.handleTongueWallCollision();
                break;
            }
            case HW3Events.PLAYER_POS_UPDATE: {
                this.handlePlayerPosUpdate(event.data.get('pos'));
                break;
            }
            default: {
                throw new Error("Unhandled event caught in TongueBehavior! Event type: " + event.type);
            }
        }
    }

    protected handleTongueWallCollision(): void {
        // TODO might not need to do anything with ID's since we only have one tongue
        // but just copying hw2 for now to try to get something rendered first
        // this.owner.position.copy(Vec2.ZERO);
        // this.owner.visible = false;
    }

    protected handlePlayerPosUpdate(pos: Vec2): void {

        // Calculate the position of the tongue tip
        const tongueBase = pos.clone().add(this.dir.normalized().scale(this.owner.size.y * 0.5));
        this.owner.position.copy(tongueBase);

        // Calculate the position of the tongue tip
        const tongueTipPos = tongueBase.clone().add(this.dir.normalized().scale(this.owner.size.y));
        this.tongueTipAABB.center.copy(tongueTipPos);
    }


    public getTongueTipAABB(): AABB {
        return this.tongueTipAABB;
    }
    
    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        // Only update the tongue if it's visible
        if (this.owner.visible) {
            // Move tongue in target direction
            //this.owner.position.add(new Vec2(1, 1));
            
            // TODO need to set up collision somewhere for this

        }
    }
}