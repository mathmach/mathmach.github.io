import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function Room(props: any) {
  const { nodes, materials } = useGLTF("/models/optimized-room.glb") as any;
  const matcapTexture = useTexture("/images/textures/mat1.png");

  const curtainMaterial = new THREE.MeshPhongMaterial({ color: "#d90429" });
  const bodyMaterial = new THREE.MeshPhongMaterial({ map: matcapTexture });
  const tableMaterial = new THREE.MeshPhongMaterial({ color: "#582f0e" });
  const radiatorMaterial = new THREE.MeshPhongMaterial({ color: "#fff" });
  const compMaterial = new THREE.MeshStandardMaterial({ color: "#fff" });
  const pillowMaterial = new THREE.MeshPhongMaterial({ color: "#8338ec" });
  const chairMaterial = new THREE.MeshPhongMaterial({ color: "#111" });

  const screenMaterial = new THREE.MeshBasicMaterial({ 
    color: "#00f2fe",
  });

  return (
    <group {...props} dispose={null}>
      {nodes._________6_blinn1_0 && <mesh geometry={nodes._________6_blinn1_0.geometry} material={curtainMaterial} />}
      {nodes.body1_blinn1_0 && <mesh geometry={nodes.body1_blinn1_0.geometry} material={bodyMaterial} />}
      {nodes.cabin_blinn1_0 && <mesh geometry={nodes.cabin_blinn1_0.geometry} material={tableMaterial} />}
      {nodes.chair_body_blinn1_0 && <mesh geometry={nodes.chair_body_blinn1_0.geometry} material={chairMaterial} />}
      {nodes.comp_blinn1_0 && <mesh geometry={nodes.comp_blinn1_0.geometry} material={compMaterial} />}
      {nodes.emis_lambert1_0 && <mesh geometry={nodes.emis_lambert1_0.geometry} material={screenMaterial} />}
      {nodes.handls_blinn1_0 && <mesh geometry={nodes.handls_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.keyboard_blinn1_0 && <mesh geometry={nodes.keyboard_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.kovrik_blinn1_0 && <mesh geometry={nodes.kovrik_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.lamp_bl_blinn1_0 && <mesh geometry={nodes.lamp_bl_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.lamp_white_blinn1_0 && <mesh geometry={nodes.lamp_white_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.miuse_blinn1_0 && <mesh geometry={nodes.miuse_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.monitor2_blinn1_0 && <mesh geometry={nodes.monitor2_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.monitor3_blinn1_0 && <mesh geometry={nodes.monitor3_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.pCylinder5_blinn1_0 && <mesh geometry={nodes.pCylinder5_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.pillows_blinn1_0 && <mesh geometry={nodes.pillows_blinn1_0.geometry} material={pillowMaterial} />}
      {nodes.polySurface53_blinn1_0 && <mesh geometry={nodes.polySurface53_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.radiator_blinn1_0 && <mesh geometry={nodes.radiator_blinn1_0.geometry} material={radiatorMaterial} />}
      {nodes.radiator_blinn1_0001 && <mesh geometry={nodes.radiator_blinn1_0001.geometry} material={materials.blinn1} />}
      {nodes.railing_blinn1_0 && <mesh geometry={nodes.railing_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.red_bttns_blinn1_0 && <mesh geometry={nodes.red_bttns_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.red_vac_blinn1_0 && <mesh geometry={nodes.red_vac_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.stylus_blinn1_0 && <mesh geometry={nodes.stylus_blinn1_0.geometry} material={materials.blinn1} />}
      {nodes.table_blinn1_0 && <mesh geometry={nodes.table_blinn1_0.geometry} material={tableMaterial} />}
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

useGLTF.preload("/models/optimized-room.glb");
