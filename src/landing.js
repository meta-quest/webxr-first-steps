/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
	BackSide,
	IcosahedronGeometry,
	Mesh,
	MeshStandardMaterial,
} from 'three';

import { ARButton } from './ARButton';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GlobalComponent } from './global';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { System } from '@lastolivegames/becsy';

const models = {
	bottle: { path: 'assets/WaterBottle.glb', inlineScale: 0.8, arScale: 1 },
	avocado: { path: 'assets/Avocado.glb', inlineScale: 1.5, arScale: 1 },
	fish: { path: 'assets/BarramundiFish.glb', inlineScale: 0.3, arScale: 0.5 },
	buggy: { path: 'assets/Buggy.glb', inlineScale: 0.002, arScale: 0.002 },
};
const CAMERA_ANGULAR_SPEED = Math.PI;

export class InlineSystem extends System {
	constructor() {
		super();
		this.globalEntity = this.query((q) => q.current.with(GlobalComponent));
		this.needsSetup = true;
	}

	_loadModels(global) {
		const loader = new GLTFLoader();
		const modelSelect = document.getElementById('model-select');
		const modelIds = [];
		const { camera, scene, renderer } = global;
		this.container = new Mesh(
			new IcosahedronGeometry(1, 1),
			new MeshStandardMaterial({ side: BackSide, color: 0x2e2e2e }),
		);
		scene.add(this.container);
		camera.position.set(0, 0.1, 0.4);
		Object.entries(models).forEach(([name, meta], index) => {
			loader.load(meta.path, (gltf) => {
				const model = gltf.scene;
				this.container.add(model);
				model.userData.inlineScale = meta.inlineScale;
				model.userData.arScale = meta.arScale;
				model.name = name + '-prototype';
				model.scale.setScalar(model.userData.inlineScale);
				const opt = document.createElement('option');
				opt.value = model.name;
				opt.innerHTML = name;
				if (index == 0) {
					opt.selected = true;
				} else {
					model.visible = false;
				}
				modelSelect.appendChild(opt);
				modelIds.push(model.id);
			});
		});
		modelSelect.onchange = function () {
			Object.keys(models).forEach((name) => {
				scene.getObjectByName(name + '-prototype').visible = false;
			});
			console.log(this.value);
			scene.getObjectById(parseInt(this.value)).visible = true;
		};
		camera.zoom = 100;
		this.orbitControls = new OrbitControls(camera, renderer.domElement);
		this.orbitControls.target.set(0, 0, 0);
		this.orbitControls.update();
		this.orbitControls.enableZoom = false;
		this.orbitControls.enablePan = false;
		this.orbitControls.enableDamping = true;
		this.orbitControls.autoRotate = true;
		this.orbitControls.rotateSpeed *= -0.5;
		this.orbitControls.autoRotateSpeed = CAMERA_ANGULAR_SPEED;
		this.wasPresenting = false;
	}

	_setupButtons(global) {
		const arButton = document.getElementById('ar-button');
		const webLaunchButton = document.getElementById('web-launch-button');
		webLaunchButton.style.display = 'none';
		ARButton.convertToARButton(arButton, global.renderer, {
			sessionInit: {
				requiredFeatures: ['hit-test', 'plane-detection', 'anchors'],
				optionalFeatures: ['local-floor', 'bounded-floor', 'layers'],
			},
			onUnsupported: () => {
				arButton.style.display = 'none';
				webLaunchButton.style.display = 'block';
			},
		});
		webLaunchButton.onclick = () => {
			window.open(
				'https://www.oculus.com/open_url/?url=' +
					encodeURIComponent(window.location.href),
			);
		};
	}

	execute() {
		const global = this.globalEntity.current[0].read(GlobalComponent);

		if (this.needsSetup) {
			this._loadModels(global);
			this._setupButtons(global);
			this.needsSetup = false;
			return;
		}

		const isPresenting = global.renderer.xr.isPresenting;
		if (!this.wasPresenting && isPresenting) {
			this.container.visible = false;
			global.scene.traverse((object) => {
				if (object.userData.arOnly) {
					object.visible = true;
				}
			});
		} else if (this.wasPresenting && !isPresenting) {
			this.container.visible = true;
			global.camera.position.set(0, 0.1, 0.4);
			global.scene.traverse((object) => {
				if (object.userData.arOnly) {
					object.visible = false;
				}
			});
		}

		if (this.container.visible) {
			this.orbitControls.update();
		}

		this.wasPresenting = isPresenting;
	}
}
