/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ARButton {
	static convertToARButton(button, renderer, options = {}) {
		function showStartAR(/*device*/) {
			const sessionInit = options.sessionInit ?? { optionalFeatures: [] };
			let currentSession;

			async function onSessionStarted(session) {
				session.addEventListener('end', onSessionEnded);
				renderer.xr.setReferenceSpaceType('local');
				await renderer.xr.setSession(session);
				button.textContent = options.LEAVE_AR_TEXT ?? 'EXIT AR';
				currentSession = session;
				if (options.onSessionStarted) options.onSessionStarted(currentSession);
			}

			function onSessionEnded(/*event*/) {
				currentSession.removeEventListener('end', onSessionEnded);
				button.textContent = options.ENTER_AR_TEXT ?? 'ENTER AR';
				if (options.onSessionEnded) options.onSessionEnded(currentSession);
				currentSession = null;
			}

			button.textContent = options.ENTER_AR_TEXT ?? 'ENTER AR';

			button.onclick = function () {
				if (!currentSession) {
					navigator.xr
						.requestSession('immersive-ar', sessionInit)
						.then(onSessionStarted);
				} else {
					currentSession.end();
				}
			};
		}

		function showARNotSupported() {
			button.onclick = null;
			button.classList.add('ar-not-supported');
			button.textContent = options.AR_NOT_SUPPORTED_TEXT ?? 'AR NOT SUPPORTED';
			if (options.onUnsupported) options.onUnsupported();
		}

		function showARNotAllowed(exception) {
			button.onclick = null;
			button.classList.add('ar-not-allowed');
			button.textContent = options.AR_NOT_ALLOWED_TEXT ?? 'AR NOT ALLOWED';
			console.warn(
				'Exception when trying to call xr.isSessionSupported',
				exception,
			);
			if (options.onNotAllowed) options.onNotAllowed(exception);
		}

		if ('xr' in navigator) {
			navigator.xr
				.isSessionSupported('immersive-ar')
				.then(function (supported) {
					supported ? showStartAR() : showARNotSupported();
				})
				.catch(showARNotAllowed);
		} else {
			showARNotSupported();
		}
	}

	static createButton(renderer, options = {}) {
		const button = document.createElement('button');
		ARButton.convertToARButton(button, renderer, options);
		return button;
	}
}
