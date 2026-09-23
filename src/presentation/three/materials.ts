import * as THREE from 'three';

interface RoomMaterials {
  curtain: THREE.MeshPhongMaterial;
  body: THREE.MeshPhongMaterial;
  table: THREE.MeshPhongMaterial;
  radiator: THREE.MeshPhongMaterial;
  computer: THREE.MeshStandardMaterial;
  pillow: THREE.MeshPhongMaterial;
  chair: THREE.MeshPhongMaterial;
  screen: THREE.MeshBasicMaterial;
}

export function createRoomMaterials(matcapTexture: THREE.Texture): RoomMaterials {
  return {
    curtain: new THREE.MeshPhongMaterial({ color: '#d90429' }),
    body: new THREE.MeshPhongMaterial({ map: matcapTexture }),
    table: new THREE.MeshPhongMaterial({ color: '#582f0e' }),
    radiator: new THREE.MeshPhongMaterial({ color: '#fff' }),
    computer: new THREE.MeshStandardMaterial({ color: '#fff' }),
    pillow: new THREE.MeshPhongMaterial({ color: '#8338ec' }),
    chair: new THREE.MeshPhongMaterial({ color: '#111' }),
    screen: new THREE.MeshBasicMaterial({ color: '#00f2fe' }),
  };
}
