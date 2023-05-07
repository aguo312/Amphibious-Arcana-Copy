import State from "../../../../Wolfie2D/DataTypes/State/State";
import GameEvent from "../../../../Wolfie2D/Events/GameEvent";
import AAAnimatedSprite from "../../../Nodes/AAAnimatedSprite";
import NPCBehavior from "../NPCBehavior";
import CanvasNode from "../../../../Wolfie2D/Nodes/CanvasNode";
import Vec2 from "../../../../Wolfie2D/DataTypes/Vec2";

/**
 * An abstract state for the PlayerController
 */
export default abstract class BossState extends State {
    protected parent: NPCBehavior;
    protected owner: AAAnimatedSprite;
    protected gravity: number;

    public constructor(parent: NPCBehavior, owner: AAAnimatedSprite) {
        super(parent);
        this.owner = owner;
        this.gravity = 500;
    }

    public abstract onEnter(options: Record<string, any>): void;

    /**
     * Handle game events from the parent.
     * @param event the game event
     */
    public handleInput(event: GameEvent): void {
        switch (event.type) {
            // Default - throw an error
            default: {
                throw new Error(`Unhandled event in PlayerState of type ${event.type}`);
            }
        }
    }

    public update(deltaT: number): void {
        // this.lockPlayer(
        //     this.owner,
        //     this.owner.getScene().getViewport().getCenter(),
        //     this.owner.getScene().getViewport().getHalfSize()
        // );
    }

    protected lockPlayer(player: CanvasNode, viewportCenter: Vec2, viewportHalfSize: Vec2): void {
        const playerLeftEdge = player.position.x - player.size.x / 4;
        const playerRightEdge = player.position.x + player.size.x / 4;
        const viewportLeftEdge = viewportCenter.x - viewportHalfSize.x;
        const viewportRightEdge = viewportCenter.x + viewportHalfSize.x;

        if (playerLeftEdge <= viewportLeftEdge) {
            player.position.x = viewportLeftEdge + player.size.x / 4;
        } else if (playerRightEdge >= viewportRightEdge) {
            player.position.x = viewportRightEdge - player.size.x / 4;
        }
    }

    public abstract onExit(): Record<string, any>;
}
