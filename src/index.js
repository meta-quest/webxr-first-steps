/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import './styles/index.css';

import { DoubleSide, MeshBasicMaterial } from 'three';
import { PlayerComponent, PlayerSystem } from './player';
import { SpawnComponent, SpawnSystem } from './spawner';
import { SpinComponent, SpinSystem } from './spin';

import { ActualizerSystem } from './actualizer';
import { GlobalComponent } from './global';
import { InlineSystem } from './landing';
import { RealityAccelerator } from 'ratk';
import { World } from '@lastolivegames/becsy';
import { setupScene } from './scene';

const worldDef = {
	defs: [
		GlobalComponent,
		PlayerComponent,
		SpawnComponent,
		PlayerSystem,
		SpawnSystem,
		ActualizerSystem,
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

	renderer.setAnimationLoop(function () {
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
