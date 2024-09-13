# Chapter 5: Making It a Game

In this chapter, we’ll turn your WebXR experience into a simple game by adding a proximity-based hit test for the targets and implementing a scoreboard to track the player’s score. These additions will make your scene more interactive and engaging, providing immediate feedback when a target is hit.

## Setting Up the Scoreboard

To display the score, we’ll use the `troika-three-text` library, which allows us to render high-quality text in Three.js. The score will be displayed on a monitor in the space station scene, giving the player a clear view of their progress.

### Scoreboard Setup

First, we define the score text and an `updateScoreDisplay` function to manage the scoreboard:

```javascript
import { Text } from 'troika-three-text';
let score = 0;
const scoreText = new Text();
scoreText.fontSize = 0.52;
scoreText.font = 'assets/SpaceMono-Bold.ttf';
scoreText.position.z = -2;
scoreText.color = 0xffa276;
scoreText.anchorX = 'center';
scoreText.anchorY = 'middle';

function updateScoreDisplay() {
	const clampedScore = Math.max(0, Math.min(9999, score));
	const displayScore = clampedScore.toString().padStart(4, '0');
	scoreText.text = displayScore;
	scoreText.sync();
}
```

#### Explanation:

- **Score Text Setup**: The `Text` object is used to display the score. We configure its font size, color, and position, ensuring it fits well within the scene.
- **`updateScoreDisplay` Function**: This function updates the score text whenever the score changes. It clamps the score between 0 and 9999 and formats it to be a four-digit number, which is then displayed on the monitor.

### Adding the Scoreboard to the Scene

Next, we add the score text to the scene in `setupScene`:

```javascript
function setupScene({ scene, camera, renderer, player, controllers }) {
	// Other setup code...

	// Add the score text to the scene
	scene.add(scoreText);
	scoreText.position.set(0, 0.67, -1.44);
	scoreText.rotateX(-Math.PI / 3.3);
	updateScoreDisplay();
}
```

#### Explanation:

- **Score Text Positioning**: The score text is positioned and rotated to align with a monitor in the space station scene, making it look like the monitor is displaying the player's score. You will need to adjust it if you are using a different environment.

## Implementing Proximity-Based Hit Test

To determine whether a bullet hits a target, we use a proximity-based hit test. This method checks the distance between the bullet and each target, and if they’re close enough, the target is considered “hit”:

```javascript
function onFrame() {
	// ... unchanged params
	Object.values(bullets).forEach((bullet) => {
		// ... unchanged logic
		targets
			.filter((target) => target.visible)
			.forEach((target) => {
				const distance = target.position.distanceTo(bullet.position);
				if (distance < 1) {
					delete bullets[bullet.uuid];
					scene.remove(bullet);

					// make target disappear, and then reappear at a different place after 2 seconds
					target.visible = false;
					setTimeout(() => {
						target.visible = true;
						target.position.x = Math.random() * 10 - 5;
						target.position.z = -Math.random() * 5 - 5;
					}, 2000);

					score += 10; // Update the score when a target is hit
					updateScoreDisplay(); // Update the rendered troika-three-text object
				}
			});
	});
}
```

### Explanation:

- **Proximity-Based Hit Test**: This method checks if the distance between the bullet and a target is less than 1 unit. If it is, the bullet is removed from the scene, and the target is temporarily hidden.
- **Updating the Score**: Each time a target is hit, the score is increased by 10 points, and the `updateScoreDisplay` function is called to refresh the displayed score.
- **Respawning Targets**: After 2 seconds, the target becomes visible again and is repositioned randomly within the scene.

- **Why Proximity-Based?**: This approach is simple and effective for our scenario because the targets are round and facing the player. However, for more advanced and reliable hit detection, especially with irregularly shaped objects or targets that aren’t facing the player, you would need to look into using raycasting.

## Summary

In this chapter, you’ve transformed your WebXR scene into a simple game by adding hit detection and a scoreboard. The proximity-based hit test provides a straightforward way to register hits, while the scoreboard keeps track of the player’s score, making the game more engaging and interactive.

Here’s what your game looks like now:

![Gameplay Screenshot](./assets/chapter5.gif)
