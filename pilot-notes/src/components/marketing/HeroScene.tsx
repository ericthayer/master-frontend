import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ACCENTS = ["#3ecf8e", "#a78bfa", "#fbbf24", "#7dd3fc", "#f472b6"];

/** A paper plane built from four triangles. */
function usePlaneGeometry() {
  return useMemo(() => {
    const g = new THREE.BufferGeometry();
    // nose, left wing, right wing, tail-left, tail-right, keel
    const v = new Float32Array([
      0, 0, 1.2, -0.9, 0, -0.8, 0, 0.05, -0.5,
      0, 0, 1.2, 0, 0.05, -0.5, 0.9, 0, -0.8,
      0, 0, 1.2, 0, 0.05, -0.5, 0, -0.35, -0.6,
    ]);
    g.setAttribute("position", new THREE.BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

function Plane() {
  const ref = useRef<THREE.Mesh>(null);
  const trail = useRef<THREE.Points>(null);
  const geo = usePlaneGeometry();
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0.5, 1), new THREE.Vector3(-1, 2, -2), new THREE.Vector3(3.5, 1, -1),
      new THREE.Vector3(4, -1, 2), new THREE.Vector3(0, -1.5, 3), new THREE.Vector3(-4, -0.5, 2.5),
    ], true, "catmullrom", 0.6),
    [],
  );
  const N = 60;
  const trailPos = useMemo(() => new Float32Array(N * 3), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.045) % 1;
    const p = curve.getPointAt(t);
    const ahead = curve.getPointAt((t + 0.01) % 1);
    if (ref.current) {
      ref.current.position.copy(p);
      ref.current.lookAt(ahead);
      ref.current.rotateZ(Math.sin(clock.elapsedTime * 1.4) * 0.35);
    }
    for (let i = 0; i < N; i++) {
      curve.getPointAt(((t - i * 0.0025) % 1 + 1) % 1, tmp);
      trailPos.set([tmp.x, tmp.y, tmp.z], i * 3);
    }
    if (trail.current) trail.current.geometry.attributes.position!.needsUpdate = true;
  });

  return (
    <>
      <mesh ref={ref} geometry={geo}>
        <meshStandardMaterial color="#e4ece9" emissive="#3ecf8e" emissiveIntensity={0.35} side={THREE.DoubleSide} flatShading />
      </mesh>
      <points ref={trail}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[trailPos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#3ecf8e" size={0.06} transparent opacity={0.7} depthWrite={false} />
      </points>
    </>
  );
}

/** Floating "lesson cards" in a slow helix. */
function Cards() {
  const group = useRef<THREE.Group>(null);
  const cards = useMemo(
    () => Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      const r = 3.2 + (i % 3) * 0.7;
      return {
        pos: [Math.cos(a) * r, ((i * 7) % 5) * 0.6 - 1.4, Math.sin(a) * r - 1.5] as [number, number, number],
        rot: [((i * 13) % 7) * 0.08 - 0.25, -a + Math.PI / 2, ((i * 5) % 3) * 0.1] as [number, number, number],
        color: ACCENTS[i % ACCENTS.length]!,
        phase: i * 0.7,
      };
    }),
    [],
  );
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = clock.elapsedTime * 0.06;
    g.children.forEach((c, i) => { c.position.y = cards[i]!.pos[1] + Math.sin(clock.elapsedTime * 0.8 + cards[i]!.phase) * 0.18; });
  });
  return (
    <group ref={group}>
      {cards.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot}>
          <boxGeometry args={[1.1, 0.7, 0.02]} />
          <meshStandardMaterial color="#192022" emissive={c.color} emissiveIntensity={0.22} metalness={0.3} roughness={0.35} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function Stars() {
  const pos = useMemo(() => {
    const a = new Float32Array(700 * 3);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < a.length; i += 3) {
      a[i] = (rnd() - 0.5) * 30; a[i + 1] = (rnd() - 0.5) * 16; a[i + 2] = -rnd() * 14 - 2;
    }
    return a;
  }, []);
  return (
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial color="#93a39e" size={0.035} transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}

/** Gentle camera parallax that follows the pointer. */
function Rig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.6 + 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ active }: { active: boolean }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.4, 8], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 6]} intensity={40} color="#7dd3fc" />
      <pointLight position={[-5, -2, 3]} intensity={30} color="#a78bfa" />
      <Stars />
      <Cards />
      <Plane />
      <Rig />
    </Canvas>
  );
}
