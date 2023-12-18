/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, System } from 'elics';

import { GlobalComponent } from './global';
import { Vector3 } from 'three';

export class SpinComponent extends Component {}

export class SpinSystem extends System {
	update(delta) {
		const global = this.getEntities(this.queries.global)[0].getComponent(
			GlobalComponent,
		);
		// update existing spin entities
		const xrCamera = global.renderer.xr.getCamera();
		for (const entity of this.getEntities(this.queries.spinners)) {
			const spinComponet = entity.getComponent(SpinComponent);
			const distance = spinComponet.object3D
				.getWorldPosition(new Vector3())
				.distanceTo(xrCamera.position);
			// calculate object angular speed based on distance between the object and headset
			spinComponet.angularSpeed = Math.min(10, (1 / distance) * 2);
			// make the object spin
			spinComponet.object3D.rotateY(spinComponet.angularSpeed * delta);
		}
	}
}

SpinSystem.queries = {
	global: { required: [GlobalComponent] },
	spinners: { required: [SpinComponent] },
};
