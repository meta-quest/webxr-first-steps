/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	BufferGeometry,
	CylinderGeometry,
	Float32BufferAttribute,
	Line,
	Mesh,
	Object3D,
} from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { GlobalComponent } from './global';
import { PlayerComponent } from './player';
import { SpinComponent } from './spin';
import { System } from 'elics';

export class SpawnSystem extends System {
	init() {
		this.hitTestTargets = {};
	}

	update() {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);
		const player = this.getEntities(this.queries.player)[0].getComponent(
			PlayerComponent,
		);
		const useHitTest = document.getElementById('use-hit-test').checked;
		const useAnchor = document.getElementById('use-anchor').checked;

		const spawnData = [];

		if (!useHitTest) {
			Object.values(player.controllers).forEach((controllerObject) => {
				const gamepad = controllerObject.gamepadWrapper;
				if (gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
					spawnData.push({
						position: controllerObject.targetRaySpace.position.clone(),
						quaternion: controllerObject.targetRaySpace.quaternion.clone(),
					});
				}
			});
		} else {
			Object.entries(player.controllers).forEach(
				([handedness, controllerObject]) => {
					if (!this.hitTestTargets[handedness]) {
						this.hitTestTargets[handedness] = new Object3D();
						addTargetRay(controllerObject.targetRaySpace);
						global.ratk
							.createHitTestTargetFromControllerSpace(handedness)
							.then((hitTestTarget) => {
								this.hitTestTargets[handedness] = hitTestTarget;
								hitTestTarget.add(
									new Mesh(new CylinderGeometry(0.1, 0.1, 0.01)),
								);
							});
					}
					const gamepad = controllerObject.gamepadWrapper;
					if (gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
						spawnData.push({
							position: this.hitTestTargets[handedness].position.clone(),
							quaternion: this.hitTestTargets[handedness].quaternion.clone(),
						});
					}
				},
			);
		}

		spawnData.forEach((transform) => {
			const object = global.scene.getObjectByName('mesh-prototype').clone();

			this.world
				.createEntity()
				.addComponent(SpinComponent, { object3D: object });
			object.userData.arOnly = true;

			if (!useAnchor) {
				// adjust object transform and directly attach object to scene
				object.position.copy(transform.position);
				object.quaternion.copy(transform.quaternion);
				global.scene.add(object);
			} else {
				// create anchor with spawn position and quaternion, and attach object to anchor
				global.ratk
					.createAnchor(transform.position, transform.quaternion)
					.then((anchor) => {
						anchor.add(object);
					});
			}
		});
	}
}

SpawnSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};

const addTargetRay = (targetRaySpace) => {
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		'position',
		new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3),
	);

	targetRaySpace.add(new Line(geometry));
};
