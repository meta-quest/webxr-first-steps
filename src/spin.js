/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { System, Type } from '@lastolivegames/becsy';

import { GlobalComponent } from './global';
import { Vector3 } from 'three';

export class SpinComponent {}

SpinComponent.schema = {
	object3D: { type: Type.object },
	angularSpeed: { type: Type.float32, default: 1 },
};

export class SpinSystem extends System {
	constructor() {
		super();
		this.globalEntity = this.query((q) => q.current.with(GlobalComponent));
		this.spinEntities = this.query((q) => q.current.with(SpinComponent).write);
	}

	execute() {
		const global = this.globalEntity.current[0].read(GlobalComponent);
		// update existing spin entities
		const xrCamera = global.renderer.xr.getCamera();
		for (const entity of this.spinEntities.current) {
			const spinComponet = entity.write(SpinComponent);
			const distance = spinComponet.object3D
				.getWorldPosition(new Vector3())
				.distanceTo(xrCamera.position);
			// calculate object angular speed based on distance between the object and headset
			spinComponet.angularSpeed = Math.min(10, (1 / distance) * 2);
			// make the object spin
			spinComponet.object3D.rotateY(spinComponet.angularSpeed * this.delta);
		}
	}
}
