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
import { System, Type } from '@lastolivegames/becsy';

import { BUTTONS } from 'gamepad-wrapper';
import { GlobalComponent } from './global';
import { PlayerComponent } from './player';

export class SpawnComponent {}

SpawnComponent.schema = {
	position: Type.vector(Type.float64, ['x', 'y', 'z']),
	quaternion: Type.vector(Type.float64, ['x', 'y', 'z', 'w']),
};

export class SpawnSystem extends System {
	constructor() {
		super();
		this.globalEntity = this.query((q) => q.current.with(GlobalComponent));
		this.playerEntity = this.query((q) => q.current.with(PlayerComponent));

		// declare write privilage on following components
		this.query((q) => q.current.using(SpinComponent).write);
		this.query((q) => q.current.using(SpawnComponent).write);

		// specify execution order
		this.schedule((s) => s.before(SpinSystem));

		this.hitTestTargets = {};
	}

	execute() {
		const global = this.globalEntity.current[0].read(GlobalComponent);
		const player = this.playerEntity.current[0].read(PlayerComponent);

		const useHitTest = document.getElementById('use-hit-test').checked;

		if (!useHitTest) {
			Object.values(player.controllers).forEach((controllerObject) => {
				const gamepad = controllerObject.gamepadWrapper;
				if (gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
					// createSpinEntity(global.scene, controllerObject.targetRaySpace, this);
					this.createEntity(SpawnComponent, {
						position: controllerObject.targetRaySpace.position.toArray(),
						quaternion: controllerObject.targetRaySpace.quaternion.toArray(),
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
						this.createEntity(SpawnComponent, {
							position: this.hitTestTargets[handedness].position.toArray(),
							quaternion: this.hitTestTargets[handedness].quaternion.toArray(),
						});
					}
				},
			);
		}
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
