import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

let cachePlane = null;

export function createTraveller() {
    const group = new THREE.Group();

    if (cachePlane != null){
        group.add(cachePlane.clone());
    }

    else{
        const mtlLoader = new MTLLoader();
        mtlLoader.load('./data/Airplane Model/11803_Airplane_v1_l1.mtl', 
            function(materials){
                materials.preload();
                const objLoader = new OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.load(
                    './data/Airplane Model/11803_Airplane_v1_l1.obj',
                    function (obj) {
                        obj.scale.set(0.0001, 0.0001, 0.0001);
                        group.add(obj);
                        cachePlane = obj;
                    }
                );
            }
        );
    }
    return group;
}