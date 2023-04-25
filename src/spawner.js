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
import { SpinComponent, SpinSystem } from './spin';

import { BUTTONS } from 'gamepad-wrapper';
import { GlobalComponent } from './global';
import { PlayerComponent } from './player';
import { System } from '@lastolivegames/becsy';

export class SpawnSystem extends System {
	constructor() {
		super();
		this.globalEntity = this.query((q) => q.current.with(GlobalComponent));
		this.playerEntity = this.query((q) => q.current.with(PlayerComponent));

		// declare write privilage on following component
		this.query((q) => q.current.using(SpinComponent).write);

		// specify execution order
		this.schedule((s) => s.before(SpinSystem));

		this.hitTestTargets = {};
	}

	execute() {
		const global = this.globalEntity.current[0].read(GlobalComponent);
		const player = this.playerEntity.current[0].read(PlayerComponent);

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
			const objectName = document.getElementById('model-select').value;
			const object = global.scene.getObjectByName(objectName).clone();
			object.scale.setScalar(object.userData.arScale);

			this.createEntity(SpinComponent, {
				object3D: object,
			});
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

const addTargetRay = (targetRaySpace) => {
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		'position',
		new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3),
	);

	targetRaySpace.add(new Line(geometry));
};
