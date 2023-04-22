import Particle from "../../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import RandUtils from "../../../Wolfie2D/Utils/RandUtils";
import { AAPhysicsGroups } from "../../AAPhysicsGroups";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";

/**
 * The particle system used for the player's weapon
 */
export default class MindFlayerParticles extends ParticleSystem {

    private particleVec: Vec2 = Vec2.ZERO;
    private dir: number = 1;

    /**
     * The rotation (in radians) to apply to the velocity vector of the particles
     */
    protected _rotation: number = 0;
    public get rotation(): number { return this._rotation; }
    public set rotation(rotation: number) { this._rotation = rotation; }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean { return this.systemRunning; }
    /**
     * 
     * @returns the particles in the pool of particles used in this particles system
     */
    public getPool(): Array<Particle> { return this.particlePool; }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        particle.vel = RandUtils.randVec(this.dir*50, this.dir*100, -30, 30);
        // Rotate the particle's velocity vector
        particle.vel.rotateCCW(this._rotation);

        // const colors = [Color.RED, Color.YELLOW, Color.ORANGE]
        const colors = [
            new Color(60, 227, 18, 1),
            new Color(58, 166, 31, 1),
            new Color(98, 232, 65, 1),
            new Color(42, 196, 4, 1)
        ];
        particle.color = colors[RandUtils.randInt(0,4)];


        if (!particle.tweens) {
            return;
        }

        // Give the particle tweens
        particle.tweens.add("active", {
            startDelay: 500,
            duration: this.lifetime/2,
            effects: [
                {
                    property: "alpha",
                    start: 1,
                    end: 0,
                    ease: EaseFunctionType.IN_OUT_SINE
                }
            ]
        });
    }

    public setDir(dir: number): void {
        this.dir = dir;
    }

    /**
     * Initializes this particle system in the given scene and layer
     * 
     * All particles in the particle system should have their physics group set to 
     * the HW4PhysicsGroup.PLAYER_WEAPON.
     * 
     * @param scene the scene
     * @param layer the layer in the scene
     */
    public initializePool(scene: Scene, layer: string) {
        super.initializePool(scene, layer);
        for (let i = 0; i < this.particlePool.length; i++) {
            // Set particle physics group to the player's weapon
            this.particlePool[i].setGroup(AAPhysicsGroups.BOSS_PARTICLE);
        }
    }

}