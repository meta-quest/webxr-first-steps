/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './styles/index.css';

import { DoubleSide, MeshBasicMaterial } from 'three';
import { PlayerComponent, PlayerSystem } from './player';
import { SpinComponent, SpinSystem } from './spin';

import { GlobalComponent } from './global';
import { InlineSystem } from './landing';
import { RealityAccelerator } from 'ratk';
import { SpawnSystem } from './spawner';
import { World } from '@lastolivegames/becsy';
import { setupScene } from './scene';

const worldDef = {
	defs: [
		GlobalComponent,
		PlayerComponent,
		PlayerSystem,
		SpawnSystem,
		SpinComponent,
		SpinSystem,
		InlineSystem,
	],
};

World.create(worldDef).then((world) => {
	let ecsexecuting = false;
	const { scene, camera, renderer } = setupScene();
	const ratk = new RealityAccelerator(renderer.xr);
	ratk.onPlaneAdded = (plane) => {
		const mesh = plane.planeMesh;
		mesh.material = new MeshBasicMaterial({
			transparent: true,
			opacity: 0.3,
			color: Math.random() * 0xffffff,
			side: DoubleSide,
		});
	};
	scene.add(ratk.root);

	world.createEntity(GlobalComponent, { renderer, camera, scene, ratk });

	let roomCaptureDelayTimer = null;
	let roomCaptureDone = false;
	renderer.setAnimationLoop(function () {
		if (renderer.xr.isPresenting && !roomCaptureDone) {
			if (ratk.planes.size > 0) {
				roomCaptureDone = true;
			} else if (roomCaptureDelayTimer == null) {
				roomCaptureDelayTimer = performance.now();
			} else if (performance.now() - roomCaptureDelayTimer > 2000) {
				console.log(renderer.xr.getSession());
				renderer.xr.getSession().initiateRoomCapture();
				roomCaptureDone = true;
			}
		}
		ratk.update();
		renderer.render(scene, camera);
		if (ecsexecuting == false) {
			ecsexecuting = true;
			world.execute().then(() => {
				ecsexecuting = false;
			});
		}
	});
});
