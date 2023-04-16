import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./hw3/Scenes/MainMenu";
import { AAControls } from "./hw3/AAControls";
import SplashScreen from "./hw3/Scenes/SplashScreen";

// The main function is your entrypoint into Wolfie2D. Specify your first scene and any options here.
(function main(){

    // Set up options for our game
    let options = {
        canvasSize: {x: 1200, y: 800},          // The size of the game
        clearColor: {r: 12, g: 14, b: 37},   // The color the game clears to
        inputs: [
            {name: AAControls.MOVE_LEFT, keys: ["a"]},
            {name: AAControls.MOVE_RIGHT, keys: ["d"]},
            {name: AAControls.JUMP, keys: ["w", "space"]},
            {name: AAControls.ATTACK, keys: ["x"]},
            {name: AAControls.SELECT_FIREBALL, keys: ["1"]},
            {name: AAControls.SELECT_ICE, keys: ["2"]},
            {name: AAControls.SELECT_TONGUE, keys: ["3"]},
            {name: AAControls.PAUSE, keys: ["escape"]}
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});
})();