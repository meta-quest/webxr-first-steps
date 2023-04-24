/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SpinComponent, SpinSystem } from './spin';

import { GlobalComponent } from './global';
import { SpawnComponent } from './spawner';
import { System } from '@lastolivegames/becsy';

export class ActualizerSystem extends System {
	constructor() {
		super();
		this.globalEntity = this.query((q) => q.current.with(GlobalComponent));
		this.spawnEntities = this.query(
			(q) => q.current.with(SpawnComponent).write,
		);
		this.query((q) => q.current.using(SpinComponent).write);
		this.schedule((s) => s.after(SpinSystem));
		this.hitTestTargets = {};
	}

	execute() {
		const global = this.globalEntity.current[0].read(GlobalComponent);
		const useAnchor = document.getElementById('use-anchor').checked;

		for (const entity of [...this.spawnEntities.current]) {
			const spawnComponent = entity.read(SpawnComponent);
			const objectName = document.getElementById('model-select').value;
			const object = global.scene.getObjectByName(objectName).clone();
			object.scale.setScalar(object.userData.arScale);

			this.createEntity(SpinComponent, {
				object3D: object,
			});
			object.userData.arOnly = true;

			if (!useAnchor) {
				// adjust object transform and directly attach object to scene
				object.position.copy(spawnComponent.position);
				object.quaternion.copy(spawnComponent.quaternion);
				global.scene.add(object);
			} else {
				// create anchor with spawn position and quaternion, and attach object to anchor
				global.ratk
					.createAnchor(spawnComponent.position, spawnComponent.quaternion)
					.then((anchor) => {
						console.log(anchor);
						anchor.add(object);
					});
			}

			entity.delete();
		}
	}
}
