import Game from "./Wolfie2D/Loop/Game";
import MainMenu from "./aa/Scenes/MainMenu";
import { AAControls } from "./aa/AAControls";
import SplashScreen from "./aa/Scenes/SplashScreen";

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
            {name: AAControls.PAUSE, keys: ["escape"]},
            {name: AAControls.GOTO_BOSS, keys: ["shift"]},
            {name: AAControls.TOGGLE_INVINCIBILITY, keys: ["i"]},
            {name: AAControls.PLAYER_KILL, keys: ["k"]},
            {name: AAControls.GOTO_LEVEL_1, keys: ["5"]},
            {name: AAControls.GOTO_LEVEL_2, keys: ["6"]},
            {name: AAControls.GOTO_LEVEL_3, keys: ["7"]},
            {name: AAControls.GOTO_LEVEL_4, keys: ["8"]},
            {name: AAControls.GOTO_LEVEL_5, keys: ["9"]},
            {name: AAControls.GOTO_LEVEL_6, keys: ["0"]},
        ],
        useWebGL: false,                        // Tell the game we want to use webgl
        showDebug: false                       // Whether to show debug messages. You can change this to true if you want
    }

    // Create a game with the options specified
    const game = new Game(options);

    // Start our game
    game.start(SplashScreen, {});
})();