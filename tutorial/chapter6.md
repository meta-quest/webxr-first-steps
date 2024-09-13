# Chapter 6: Finishing Touches

Now that you have a fully functioning WebXR game, it's time to add some finishing touches to enhance the overall experience. In this final chapter, we'll introduce audio, haptic feedback, and visual effects to make your game more immersive and engaging. These elements will provide immediate feedback to the player, making the game feel more polished and interactive.

## Adding Audio Feedback

We’ll start by adding audio feedback for firing the blaster and scoring points. Three.js provides a straightforward way to handle audio using its audio system, which we’ll leverage here.

### Setting Up Audio

First, we declare global variables for the sounds:

```javascript
let laserSound, scoreSound;
```

Next, inside the `setupScene` function, we create an audio listener and load the positional audio files:

```javascript
function setupScene({ scene, camera, renderer, player, controllers }) {
	// Other setup code...

	// Load and set up positional audio
	const listener = new THREE.AudioListener();
	camera.add(listener);

	const audioLoader = new THREE.AudioLoader();

	// Laser sound
	laserSound = new THREE.PositionalAudio(listener);
	audioLoader.load('assets/laser.ogg', (buffer) => {
		laserSound.setBuffer(buffer);
		blasterGroup.add(laserSound);
	});

	// Score sound
	scoreSound = new THREE.PositionalAudio(listener);
	audioLoader.load('assets/score.ogg', (buffer) => {
		scoreSound.setBuffer(buffer);
		scoreText.add(scoreSound);
	});
}
```

### Explanation:

- **Audio Listener**: The `AudioListener` is essentially the "ears" of the camera. It’s necessary for hearing the sounds in the scene. We attach it to the camera so that the audio follows the player's perspective.

- **Positional Audio**: We use `PositionalAudio` to make the sounds feel like they’re coming from specific points in the 3D space. The laser sound is attached to the blaster, and the score sound is attached to the scoreboard text.

### Playing the Sounds

We trigger the sounds when appropriate actions occur:

- **Firing the Blaster**:

  ```javascript
  if (laserSound.isPlaying) laserSound.stop();
  laserSound.play();
  ```

- **Scoring Points**:

  ```javascript
  if (scoreSound.isPlaying) scoreSound.stop();
  scoreSound.play();
  ```

This ensures that the sounds are played without overlap, providing clear audio feedback to the player.

## Adding Haptic Feedback

To enhance the tactile experience, we add haptic feedback when the player fires the blaster. This simple vibration adds a layer of immersion, making the action feel more impactful:

```javascript
try {
	const hapticActuator = gamepad.getHapticActuator(0).pulse(0.6, 100);
} catch {}
```

### Explanation:

- **Haptic Feedback**: The `pulse` method triggers a short vibration at 60% intensity for 100 milliseconds.
- **Try-Catch Block**: We use a try-catch block to ensure that the application doesn’t crash on devices that don’t have haptic actuators.

## Adding Visual Feedback

Finally, we enhance the visual feedback when a target is hit by animating its disappearance and reappearance using GSAP. Instead of having the target abruptly disappear and reappear, we smoothly scale it down and back up. Let's first locate the target disappear/reappear logic based on `setTimeout`:

```javascript
target.visible = false;
setTimeout(() => {
	target.visible = true;
	target.position.x = Math.random() * 10 - 5;
	target.position.z = -Math.random() * 5 - 5;
}, 2000);
```

And replace it with:

```javascript
import { gsap } from 'gsap';

gsap.to(target.scale, {
	duration: 0.3,
	x: 0,
	y: 0,
	z: 0,
	onComplete: () => {
		target.visible = false;
		setTimeout(() => {
			target.visible = true;
			target.position.x = Math.random() * 10 - 5;
			target.position.z = -Math.random() * 5 - 5;

			// Scale back up the target
			gsap.to(target.scale, {
				duration: 0.3,
				x: 1,
				y: 1,
				z: 1,
			});
		}, 1000);
	},
});
```

### Explanation:

- **Scaling Down**: When a target is hit, it scales down to zero over 0.3 seconds, creating a smooth disappearing effect.
- **Respawning with Animation**: After 1 second, the target reappears, scaling back up to its original size over 0.3 seconds. This makes the reappearance feel smooth and natural.
-

### Final Step: Updating the GSAP Ticker

To ensure GSAP animations are synchronized with your WebXR frame updates, include this at the end of your `onFrame` function:

```javascript
gsap.ticker.tick(delta);
```

## Congratulations!

Congratulations! You’ve completed the entire WebXR First Steps tutorial and built a fully immersive and interactive game. Here’s a final look at your game in action:

![Shrinking Targets](./assets/chapter6.gif)

## What's Next?

Although the tutorial is over, your journey with WebXR has just begun. There are countless ways to expand and enhance your game. Here are some ideas to get you started:

- **Dual Wielding**: Add a second blaster to the other controller for dual-wielding action.
- **Timed Challenge**: Introduce a timer to make it a race against the clock.
- **Moving Targets**: Make the targets move around to increase the difficulty.
- **Exploding Targets**: Add visual effects to make the targets explode when hit.
- **And More!**: Your imagination is the limit—experiment, add new features, and make the game truly your own!

Thank you for following along with this tutorial. I hope it’s been a fun and educational journey into the world of WebXR. Happy coding!
