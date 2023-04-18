import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import AALevel from "../Scenes/AALevel";

/**
 * An animated sprite in the HW3Level. I have extended the animated sprite to create a more specific sprite
 * with a reference to a HW3Level. One of the things I want to try and show all of you is how to extend
 * Wolfie2d. 
 * 
 * For the HW3AnimatedSprite, I've just overriden the type of the scene and the associated getter/setter
 * methods. Without this, you would have to explicitly cast the type of the scene to a HW3Level to get access
 * to the methods associated with HW3Level. 
 * 
 * - Peter
 */
export default class AAAnimatedSprite extends AnimatedSprite {

    protected scene: AALevel;
    
    public setScene(scene: AALevel): void { this.scene = scene; }
    public getScene(): AALevel { return this.scene; }
}