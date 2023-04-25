import { PlayerStates, PlayerAnimations } from "../PlayerController";
import PlayerState from "./PlayerState";
import PlayerController from "../PlayerController";
import Input from "../../../../Wolfie2D/Input/Input";
import { AAControls } from "../../../AAControls";
import MathUtils from "../../../../Wolfie2D/Utils/MathUtils";

export default class Idle extends PlayerState {

	public onEnter(options: Record<string, any>): void {
        this.owner.animation.play(PlayerAnimations.IDLE);
		this.parent.speed = this.parent.MIN_SPEED;

        this.parent.velocity.x = 0;
        this.parent.velocity.y = 0;
	}

	public update(deltaT: number): void {
        // Adjust the direction the player is facing
		super.update(deltaT);

        // Get the direction of the player's movement
		let dir = this.parent.inputDir;

        if(!this.owner.animation.isPlaying(PlayerAnimations.TAKING_DAMAGE) && !this.owner.animation.isPlaying(PlayerAnimations.ATTACK)){
            this.owner.animation.playIfNotAlready(PlayerAnimations.IDLE);
        }
        // If the player is moving along the x-axis, transition to the walking state
		if (!dir.isZero() && dir.y === 0){
			this.finished(PlayerStates.RUN);
		} 
        // If the player is jumping, transition to the jumping state
        else if (Input.isJustPressed(AAControls.JUMP)) {
            this.finished(PlayerStates.JUMP);
        }
        // If the player is not on the ground, transition to the falling state
        else if (!this.owner.onGround && this.parent.velocity.y > 0) {
            this.finished(PlayerStates.FALL);
        } else {
            // Update the vertical velocity of the player
            // If player stationary on ground, don't add to velocity, just set it
            // This check could probably be better but works for now
            if (this.parent.velocity.y === 0 || this.parent.velocity.y === this.gravity*deltaT) {
                this.parent.velocity.y = this.gravity*deltaT;

            // Otherwise if we have a velocity from a firejump (or something else), add to velocity
            } else {
                this.parent.velocity.y += this.gravity*deltaT;
            }

            if (this.parent.velocity.x > 0)
                this.parent.velocity.x = MathUtils.clampLow(this.parent.velocity.x - this.gravity*deltaT, 0);
            else 
                this.parent.velocity.x = MathUtils.clampHigh(this.parent.velocity.x + this.gravity*deltaT, 0);

            // Move the player
            this.owner.move(this.parent.velocity.scaled(deltaT));
        }

        // Otherwise, do nothing (keep idling)
		
	}

	public onExit(): Record<string, any> {
		this.owner.animation.stop();
		return {};
	}
}