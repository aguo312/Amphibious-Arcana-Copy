import Particle from "../../../Wolfie2D/Nodes/Graphics/Particle";
import ParticleSystem from "../../../Wolfie2D/Rendering/Animations/ParticleSystem";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import { AAPhysicsGroups } from "../../AAPhysicsGroups";
import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../../Wolfie2D/Events/GameEvent";
import { AAEvents } from "../../AAEvents";
import Receiver from "../../../Wolfie2D/Events/Receiver";
import AAAnimatedSprite from "../../Nodes/AAAnimatedSprite";
import Graphic from "../../../Wolfie2D/Nodes/Graphic";

/**
 * The particle system used for the player's weapon
 */
export default class TongueParticle extends ParticleSystem {
    protected receiver: Receiver;
    private player: AAAnimatedSprite;
    private owner: Graphic;

    /**
     * The rotation (in radians) to apply to the velocity vector of the particles
     */
    protected _rotation = 0;
    public get rotation(): number {
        return this._rotation;
    }
    public set rotation(rotation: number) {
        this._rotation = rotation;
    }

    /**
     * @returns true if the particle system is running; false otherwise.
     */
    public isSystemRunning(): boolean {
        return this.systemRunning;
    }
    /**
     *
     * @returns the particles in the pool of particles used in this particles system
     */
    public getPool(): Array<Particle> {
        return this.particlePool;
    }

    /**
     * Sets the animations for a particle in the player's weapon
     * @param particle the particle to give the animation to
     */
    public setParticleAnimation(particle: Particle) {
        // Give the particle a random velocity.
        //particle.vel = RandUtils.randVec(-32, 32, 100, 200);
        particle.vel = new Vec2(0, 252);
        // Rotate the particle's velocity vector
        particle.vel.rotateCCW(this._rotation);
        particle.color = Color.TRANSPARENT;
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
            this.particlePool[i].setGroup(AAPhysicsGroups.TONGUE);
        }

        this.receiver = new Receiver();
        this.receiver.subscribe(AAEvents.PLAYER_CREATED);
    }

    public update(deltaT: number) {
        super.update(deltaT);

        while (this.receiver.hasNextEvent()) {
            this.handleEvent(this.receiver.getNextEvent());
        }

        if (this.player && this.owner && this.isSystemRunning()) {
            const particle = this.particlePool[0];

            const newPos = this.owner.position
                .clone()
                .add(particle._velocity.normalized().scale(this.owner.size.y / 2));

            particle.position.copy(newPos);
        }
    }

    public handleEvent(event: GameEvent): void {
        switch (event.type) {
            case AAEvents.PLAYER_CREATED: {
                this.player = event.data.get("player");
                this.owner = event.data.get("tongue");
                break;
            }
            default: {
                throw new Error(
                    `Unhandled event caught in TongueParticle! Event type: ${event.type}`
                );
            }
        }
    }

    protected handlePlayerPosUpdate(vel: Vec2): void {
        if (this.particlePool.length > 0 && this.isSystemRunning()) {
            const particle = this.particlePool[0];
            if (!particle) {
                return;
            }

            const newPos = particle.position.clone().add(vel.normalized());
            particle.position.copy(newPos);
        }
    }
}
