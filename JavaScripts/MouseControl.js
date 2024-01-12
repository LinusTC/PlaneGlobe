import * as THREE from 'three';
import {globe, camera, targetRotation, renderer} from './main.js';

let isLeftButtonDown = false;
let prevMouse = { x: 0, y: 0 };
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
        prevMouse = {
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
        const currMouse = {
            x: event.clientX / window.innerWidth * 2 - 1,
            y: (event.clientY / window.innerHeight) * 2 + 1
        };

        targetRotation.y += currMouse.x - prevMouse.x;
        targetRotation.x += currMouse.y - prevMouse.y;

        prevMouse = currMouse;
    }
}

export function handleWheel(event) {
    if (cursorOnGlobe) {
        const scrollSpeed = 0.003;

        const yDelta = event.deltaY;
        targetRotation.x += -yDelta * scrollSpeed;
        const xDelta = event.deltaX;
        targetRotation.y += -xDelta * scrollSpeed;

        if (event.target === renderer.domElement) {
            event.preventDefault();
        }
    }
}

