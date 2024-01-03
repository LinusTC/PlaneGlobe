import * as THREE from 'three';
import {globe, camera, targetRotation, renderer} from './main.js';

let isLeftButtonDown = false;
let previousMousePosition = { x: 0, y: 0 };
let cursorOnGlobe = false;

function checkIfClickedOnGlobe(event, camera) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(globe);

    if (intersects.length > 0) {
        cursorOnGlobe = true;
    } else {
        cursorOnGlobe = false;
    }
}

export function handleMouseDown(event) {
    if (event.button === 0) {
        isLeftButtonDown = true;
        previousMousePosition = {
            x: event.clientX / window.innerWidth * 2 - 1,
            y: event.clientY / window.innerHeight * 2 + 1
        };

        checkIfClickedOnGlobe(event, camera, globe);
    }
}

export function handleMouseUp(event) {
    if (event.button === 0) {
        isLeftButtonDown = false;
    }
}

export function handleMouseMove(event) {
    if (isLeftButtonDown && cursorOnGlobe) {
        const currentMousePosition = {
            x: event.clientX / window.innerWidth * 2 - 1,
            y: (event.clientY / window.innerHeight) * 2 + 1
        };

        targetRotation.y += currentMousePosition.x - previousMousePosition.x;
        targetRotation.x += currentMousePosition.y - previousMousePosition.y;

        previousMousePosition = currentMousePosition;
    }
}

export function handleWheel(event) {
    if (cursorOnGlobe) {
        const scrollSpeed = 0.003;

        const verticalChange = event.deltaY;
        targetRotation.x += -verticalChange * scrollSpeed;
        const horizontalChange = event.deltaX;
        targetRotation.y += -horizontalChange * scrollSpeed;

        if (event.target === renderer.domElement) {
            event.preventDefault();
        }
    }
}

