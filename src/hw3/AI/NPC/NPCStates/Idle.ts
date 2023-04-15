// import PlayerState from '../../Player/PlayerStates/PlayerState';
// import { EnemyAnimations } from '../../../Enemy/EnemyController';

// export default class Idle extends PlayerState {
//     public onEnter(options: Record<string, any>): void {
//         this.owner.animation.play(EnemyAnimations.IDLE);
//         this.parent.speed = this.parent.MIN_SPEED;

//         this.parent.velocity.x = 0;
//         this.parent.velocity.y = 0;
//     }

//     public update(deltaT: number): void {
//         // Adjust the direction the enemy is facing
//         super.update(deltaT);


//     }
// }