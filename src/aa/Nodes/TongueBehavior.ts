import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import Graphic from "../../Wolfie2D/Nodes/Graphic";
import { AAEvents } from "../AAEvents";
import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Timer from "../../Wolfie2D/Timing/Timer";
import { AAPhysicsGroups } from "../AAPhysicsGroups";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Emitter from "../../Wolfie2D/Events/Emitter";
import AAAnimatedSprite from "./AAAnimatedSprite";
import { GameEventType } from "../../Wolfie2D/Events/GameEventType";

enum TongueState {
    EXTENDING,
    RETRACTING,
}

export default class TongueBehavior implements AI {
    // The GameNode that owns this behavior
    private owner: Graphic;

    private player: AAAnimatedSprite;

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
    private emitter: Emitter;

    protected tongueTimer: Timer;

    private tongueTipAABB: AABB;

    private state: TongueState;
    private maxDistance: number;
    private distanceTraveled: number;

    private tongueActive: boolean;
    private stopExtending: boolean;

    private playerPos: Vec2;
    private attachedEnemy: AAAnimatedSprite;
    private frozenOverlay: AnimatedSprite;

    private wallCollision: boolean;

    public initializeAI(owner: Graphic, options: Record<string, any>): void {
        this.owner = owner;
        // this.player = options.player;

        this.src = Vec2.ZERO;
        this.dir = Vec2.ZERO;

        this.currentXSpeed = 50;
        this.xSpeedIncrement = 0;
        this.minXSpeed = 50;
        this.maxXSpeed = 50;

        this.currentYSpeed = 250;
        this.ySpeedIncrement = 0;
        this.minYSpeed = 50;
        this.maxYSpeed = 50;

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.ENEMY_ATTACHED);
        this.receiver.subscribe(AAEvents.TONGUE_WALL_COLLISION);
        this.receiver.subscribe(AAEvents.SHOOT_TONGUE);
        this.receiver.subscribe(AAEvents.PLAYER_CREATED);

        this.emitter = new Emitter();
        this.state = TongueState.EXTENDING;
        this.maxDistance = 123; // Set the maximum distance the tongue can extend
        this.distanceTraveled = 0;

        this.tongueActive = false;

        this.playerPos = Vec2.ZERO;

        this.stopExtending = false;

        this.attachedEnemy = null;
        this.frozenOverlay = null;

        this.wallCollision = false;
        this.activate(options);
    }

    public destroy(): void {}

    public activate(options: Record<string, any>): void {
        //this.receiver.ignoreEvents();
        this.src.copy(options.src);
        this.dir.copy(options.dir);

        // Set the size of the tongue
        this.owner.size = new Vec2(3, 1);

        // Set the position of the tongue
        const tongueBase = this.src
            .clone()
            .add(this.dir.normalized().scale(this.owner.size.y * 0.5));
        this.owner.position.copy(tongueBase);
        this.owner.rotation = Vec2.RIGHT.angleToCCW(this.dir) - Math.PI / 2;

        this.owner.boundary.sweep(new Vec2(5, 5), this.src, this.dir);

        this.owner.addPhysics();
        this.owner.setGroup(AAPhysicsGroups.TONGUE);

        //this.tongueTipAABB = new AABB(this.owner.position.clone().add(this.dir.normalized().scale(this.owner.size.y/2)), new Vec2(this.owner.size.x/2, this.owner.size.y/2));
        // Set the collision shape of the tongue - these values are probably wrong
        // TODO Make AABB just the tip of the tongue so rotation doesn't matter?
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.TONGUE_WALL_COLLISION: {
                this.wallCollision = true;
                this.handleTongueWallCollision();
                break;
            }
            case AAEvents.ENEMY_ATTACHED: {
                const enemy = event.data.get("enemy");
                if (enemy && enemy.health / enemy.maxHealth <= 1 / 3) {
                    this.attachedEnemy = enemy;
                    this.frozenOverlay = event.data.get("overlay");
                } else {
                    enemy.health -= 0.5;
                }
                this.stopExtending = true;
                break;
            }
            case AAEvents.SHOOT_TONGUE: {
                if (!this.tongueActive) {
                    this.resetState();
                }
                break;
            }
            case AAEvents.PLAYER_CREATED: {
                this.player = event.data.get("player");
                break;
            }
            default: {
                throw new Error(
                    "Unhandled event caught in TongueBehavior! Event type: " + event.type
                );
            }
        }
    }

    protected handleTongueWallCollision(): void {
        // TODO might not need to do anything with ID's since we only have one tongue
        // but just copying hw2 for now to try to get something rendered first
        // this.owner.position.copy(Vec2.ZERO);
        // this.owner.visible = false;

        this.stopExtending = true;
    }

    protected handlePlayerPosUpdate(pos: Vec2): void {
        // Calculate the position of the tongue base
        const tongueBase = pos.clone().add(this.dir.normalized().scale(this.owner.size.y * 0.5));
        this.playerPos = pos.clone();
        this.owner.position.copy(tongueBase);
    }

    public getTongueTipAABB(): AABB {
        return this.tongueTipAABB;
    }

    private resetState(): void {
        this.state = TongueState.EXTENDING;
        this.distanceTraveled = 0;
        this.tongueActive = true;
        this.stopExtending = false;
        this.attachedEnemy = null;
        this.frozenOverlay = null;
        this.wallCollision = false;
    }

    public update(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (!this.player) {
            return;
        }

        const tongueBase = this.player.position
            .clone()
            .add(this.dir.normalized().scale(this.owner.size.y * 0.5));
        this.playerPos = this.player.position.clone();
        this.owner.position.copy(tongueBase);

        // Check if there's an attached enemy
        if (this.attachedEnemy && !this.wallCollision) {
            const tongueMovement = this.dir.normalized().scale(-this.currentYSpeed * deltaT);

            this.attachedEnemy.freeze();
            // Calculate the vector from the enemy to the player
            const direction = this.playerPos.clone().sub(this.attachedEnemy.position);

            // Calculate the distance that the enemy moves per frame in the X and Y directions
            const movementX = direction.normalized().x * tongueMovement.mag();
            const movementY = direction.normalized().y * tongueMovement.mag();
            const scaleDelta = 0.01;

            // Move the enemy towards the player
            this.attachedEnemy.position.add(new Vec2(movementX, movementY));
            if (this.frozenOverlay) {
                this.frozenOverlay.position.add(new Vec2(movementX, movementY));
                this.frozenOverlay.scale.sub(new Vec2(1, 1));
            }
            // Decrease the enemy's scale each frame
            this.attachedEnemy.scale.sub(new Vec2(scaleDelta, scaleDelta));
        }

        // Only update the tongue if it's visible and the flag is not set to stop extending
        if (this.owner.visible) {
            // TODO need to set up collision somewhere for this
            let movement: Vec2;

            if (this.stopExtending) {
                this.state = TongueState.RETRACTING;
            }

            if (this.state === TongueState.EXTENDING) {
                movement = this.dir.normalized().scale(this.currentYSpeed * deltaT);
                this.distanceTraveled += movement.mag();

                // Increase the height of the tongue
                this.owner.size.y += movement.mag();

                if (this.distanceTraveled >= this.maxDistance) {
                    this.state = TongueState.RETRACTING;
                }
            } else if (this.state === TongueState.RETRACTING) {
                movement = this.dir.normalized().scale(-this.currentYSpeed * deltaT);
                this.distanceTraveled -= movement.mag();

                // Decrease the height of the tongue
                this.owner.size.y -= movement.mag();

                if (this.distanceTraveled <= 0) {
                    // Hide the tongue and stop updating when fully retracted
                    this.owner.visible = false;
                    this.distanceTraveled = 0;
                    this.tongueActive = false;
                    this.stopExtending = false;
                    if (this.attachedEnemy) {
                        if (this.frozenOverlay) {
                            this.frozenOverlay.destroy();
                        }
                        this.emitter.fireEvent(AAEvents.NPC_KILLED, {
                            node: this.attachedEnemy.id,
                        });
                        this.emitter.fireEvent(AAEvents.PLAYER_HEAL);
                    }
                    this.attachedEnemy = null;
                    this.frozenOverlay = null;
                    return;
                }
            }

            // const tongueBase = this.player.position
            //     .clone()
            //     .add(this.dir.normalized().scale(this.owner.size.y * 0.5));
            // this.playerPos = this.player.position.clone();
            // this.owner.position.copy(tongueBase);
            this.owner.position.add(movement);
        }
    }
}
