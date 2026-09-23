import { useGLTF, useTexture } from '@react-three/drei';
import { useMemo } from 'react';
import { createRoomMaterials } from './materials';

export function Room(props: any) {
  const { nodes, materials } = useGLTF('/models/optimized-room.glb') as any;
  const matcapTexture = useTexture('/images/textures/mat1.png');

  const roomMaterials = useMemo(() => createRoomMaterials(matcapTexture), [matcapTexture]);

  return (
    <group {...props} dispose={null}>
      {nodes._________6_blinn1_0 && (
        <mesh geometry={nodes._________6_blinn1_0.geometry} material={roomMaterials.curtain} />
      )}
      {nodes.body1_blinn1_0 && <mesh geometry={nodes.body1_blinn1_0.geometry} material={roomMaterials.body} />}
      {nodes.cabin_blinn1_0 && <mesh geometry={nodes.cabin_blinn1_0.geometry} material={roomMaterials.table} />}
      {nodes.chair_body_blinn1_0 && (
        <mesh geometry={nodes.chair_body_blinn1_0.geometry} material={roomMaterials.chair} />
      )}
      {nodes.comp_blinn1_0 && <mesh geometry={nodes.comp_blinn1_0.geometry} material={roomMaterials.computer} />}
      {nodes.emis_lambert1_0 && <mesh geometry={nodes.emis_lambert1_0.geometry} material={roomMaterials.screen} />}
      {nodes.handls_blinn1_0 && <mesh geometry={nodes.handls_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.keyboard_blinn1_0 && <mesh geometry={nodes.keyboard_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.kovrik_blinn1_0 && <mesh geometry={nodes.kovrik_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.lamp_bl_blinn1_0 && <mesh geometry={nodes.lamp_bl_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.lamp_white_blinn1_0 && <mesh geometry={nodes.lamp_white_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.miuse_blinn1_0 && <mesh geometry={nodes.miuse_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.monitor2_blinn1_0 && <mesh geometry={nodes.monitor2_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.monitor3_blinn1_0 && <mesh geometry={nodes.monitor3_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.pCylinder5_blinn1_0 && <mesh geometry={nodes.pCylinder5_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.pillows_blinn1_0 && <mesh geometry={nodes.pillows_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.polySurface53_blinn1_0 && (
        <mesh geometry={nodes.polySurface53_blinn1_0.geometry} material={materials.blinn1} />
      )}
      {nodes.radiator_blinn1_0 && (
        <mesh geometry={nodes.radiator_blinn1_0.geometry} material={roomMaterials.radiator} />
      )}
      {nodes.radiator_blinn1_0001 && (
        <mesh geometry={nodes.radiator_blinn1_0001.geometry} material={materials.blinn1} />
      )}
      {nodes.railing_blinn1_0 && <mesh geometry={nodes.railing_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.red_bttns_blinn1_0 && <mesh geometry={nodes.red_bttns_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.red_vac_blinn1_0 && <mesh geometry={nodes.red_vac_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.stylus_blinn1_0 && <mesh geometry={nodes.stylus_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.table_blinn1_0 && <mesh geometry={nodes.table_blinn1_0.geometry} material={roomMaterials.table} />}
      {nodes.tablet_blinn1_0 && <mesh geometry={nodes.tablet_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.triangle_blinn1_0 && <mesh geometry={nodes.triangle_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.vac_black_blinn1_0 && <mesh geometry={nodes.vac_black_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.vacuum1_blinn1_0 && <mesh geometry={nodes.vacuum1_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.vacuumgrey_blinn1_0 && <mesh geometry={nodes.vacuumgrey_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.vires_blinn1_0 && <mesh geometry={nodes.vires_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.window_blinn1_0 && <mesh geometry={nodes.window_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.window4_phong1_0 && <mesh geometry={nodes.window4_phong1_0.geometry} material={materials.phong1} />}
    </group>
  );
}

useGLTF.preload('/models/optimized-room.glb');
