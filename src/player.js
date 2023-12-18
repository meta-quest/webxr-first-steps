/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';

import { GamepadWrapper } from 'gamepad-wrapper';
import { GlobalComponent } from './global';
import { Group } from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export class PlayerComponent extends Component {}

export class PlayerSystem extends System {
	_setup(global) {
		const { renderer, camera, scene } = global;
		const controllers = {};

		for (let i = 0; i < 2; i++) {
			const controllerModelFactory = new XRControllerModelFactory();
			const controllerGrip = renderer.xr.getControllerGrip(i);
			controllerGrip.add(
				controllerModelFactory.createControllerModel(controllerGrip),
			);
			scene.add(controllerGrip);
			const targetRaySpace = renderer.xr.getController(i);
			targetRaySpace.addEventListener('connected', async function (event) {
				this.handedness = event.data.handedness;
				const gamepadWrapper = new GamepadWrapper(event.data.gamepad);
				controllers[event.data.handedness] = {
					targetRaySpace: targetRaySpace,
					gripSpace: controllerGrip,
					gamepadWrapper: gamepadWrapper,
				};
			});
			targetRaySpace.addEventListener('disconnected', function () {
				delete controllers[this.handedness];
			});
			scene.add(targetRaySpace);
		}

		const playerSpace = new Group();
		playerSpace.add(camera);
		this.world.createEntity().addComponent(PlayerComponent, {
			space: playerSpace,
			controllers: controllers,
		});
	}

	update() {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);

		const player = this.getEntities(this.queries.player)[0]?.getComponent(
			PlayerComponent,
		);

		if (!player) {
			this._setup(global);
		} else {
			Object.values(player.controllers).forEach((controllerObject) => {
				if (controllerObject) controllerObject.gamepadWrapper.update();
			});
		}
	}
}

PlayerSystem.queries = {
	global: { required: [GlobalComponent] },
	player: { required: [PlayerComponent] },
};
