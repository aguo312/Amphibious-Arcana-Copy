import { PlayerStates, PlayerAnimations } from "../PlayerController";
import Input from "../../../../Wolfie2D/Input/Input";
import { AAControls } from "../../../AAControls";
import PlayerState from "./PlayerState";
import MathUtils from "../../../../Wolfie2D/Utils/MathUtils";

export default class Walk extends PlayerState {

    private firstUpdate: boolean;

	onEnter(options: Record<string, any>): void {
        console.log('Entering RUN');
        this.firstUpdate = true;
		this.parent.speed = this.parent.MIN_SPEED;
        this.owner.animation.play(PlayerAnimations.WALK);
	}

	update(deltaT: number): void {
        // Call the update method in the parent class - updates the direction the player is facing
        super.update(deltaT);

        // Get the input direction from the player controller
		let dir = this.parent.inputDir;

    
        // If the player is not moving - transition to the Idle state
		if(dir.isZero()){
			this.finished(PlayerStates.IDLE);
		} 
        // If the player hits the jump key - transition to the Jump state
        else if (Input.isJustPressed(AAControls.JUMP)) {
            this.finished(PlayerStates.JUMP);
        } 
        // If the player is not on the ground, transition to the fall state
        else if (!this.firstUpdate && !this.owner.onGround && this.parent.velocity.y !== 0) {
            this.finished(PlayerStates.FALL);
        }
        // Otherwise, move the player
        else {
            // Update the vertical velocity of the player
            // If player stationary on ground, don't add to velocity, just set it
            // This check could probably be better but works for now
            if (this.parent.velocity.y === 0 || this.parent.velocity.y === this.gravity*deltaT) {
                this.parent.velocity.y = this.gravity*deltaT;

            // Otherwise if we have a velocity from a firejump (or something else), add to velocity
            } else {
                this.parent.velocity.y += this.gravity*deltaT;
            }

            this.parent.velocity.x = dir.x * this.parent.speed;

            if (this.parent.velocity.x > 0)
                this.parent.velocity.x = MathUtils.clampLow(this.parent.velocity.x - this.gravity*deltaT, 0);
            else 
                this.parent.velocity.x = MathUtils.clampHigh(this.parent.velocity.x + this.gravity*deltaT, 0);


            if(!this.owner.animation.isPlaying(PlayerAnimations.ATTACK)){
                this.owner.animation.playIfNotAlready(PlayerAnimations.WALK)
            }
        
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

        this.firstUpdate = false;
        console.log('velocity: ' + this.parent.velocity);

	}

	onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}