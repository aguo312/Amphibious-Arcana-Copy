import Input from "../../../../Wolfie2D/Input/Input";
import MathUtils from "../../../../Wolfie2D/Utils/MathUtils";
import { HW3Controls } from "../../../HW3Controls";
import { PlayerStates } from "../PlayerController";
import PlayerState from "./PlayerState";

export default class Fall extends PlayerState {

    onEnter(options: Record<string, any>): void {
        console.log('entering fall');
        // If we're falling, the vertical velocity should be >= 0
        // commenting this out bc it was preventing the fireball jumps from working
        if (this.parent.velocity.y > 0) {
            this.parent.velocity.y = 0;
        }
    } 

    update(deltaT: number): void {

        // If the player hits the ground, start idling and check if we should take damage
        if (this.owner.onGround) {
            this.parent.health -= Math.floor(this.parent.velocity.y / 300);
            this.finished(PlayerStates.IDLE);
        } 
        // Otherwise, keep moving
        else {
            // Get the movement direction from the player 
            let dir = this.parent.inputDir;

            // Update the horizontal velocity of the player
            if (this.parent.isFirejumpActive) {
                this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.2*this.parent.velocity.x;
            } else {
                this.parent.velocity.x += dir.x * this.parent.speed/3.5 - 0.3*this.parent.velocity.x;
            }

            // Update the vertical velocity of the player
            
            if(Input.isPressed(HW3Controls.JUMP) && this.parent.velocity.y >= 0){
                this.parent.velocity.y += this.gravity*deltaT * 0.20;
            }else{
                this.parent.velocity.y += this.gravity*deltaT;
            }
            // Move the player
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

    } 

    onExit(): Record<string, any> {
        this.parent.isFirejumpActive = false;
        return {};
    }
}