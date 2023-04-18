import CanvasNodeFactory from "../../Wolfie2D/Scene/Factories/CanvasNodeFactory";
import AAAnimatedSprite from "../Nodes/AAAnimatedSprite";
import AALevel from "../Scenes/AALevel";

/**
 * An extension of Wolfie2ds CanvasNodeFactory. The purpose of the class is to add functionality for adding custom
 * game nodes to HW3Levels. 
 */
export default class AACanvasNodeFactory extends CanvasNodeFactory {

    // Reference to the HW4Level
    protected scene: AALevel;
    
    // Overriden to only accept HW4Levels
    public init(scene: AALevel): void { super.init(scene); }

    // Overriden to return HW3AnimatedSprites instead of regular AnimatedSprites
    public addAnimatedSprite = (key: string, layerName: string): AAAnimatedSprite => {
        let layer = this.scene.getLayer(layerName);
		let spritesheet = this.resourceManager.getSpritesheet(key);
		let instance = new AAAnimatedSprite(spritesheet);

		// Add instance fo scene
		instance.setScene(this.scene);
		instance.id = this.scene.generateId();
		
		if(!(this.scene.isParallaxLayer(layerName) || this.scene.isUILayer(layerName))){
			this.scene.getSceneGraph().addNode(instance);
		}

		// Add instance to layer
		layer.addNode(instance);

		return instance;
    }
}