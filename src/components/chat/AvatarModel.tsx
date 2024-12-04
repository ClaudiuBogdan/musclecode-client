import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useAvatarStore } from "@/stores/avatar";
import * as THREE from "three";

type AvatarModelProps = {
  url: string;
};

export function AvatarModel({ url }: AvatarModelProps) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  const { isChatOpen, messages, isProcessing } = useAvatarStore();

  const rotationSpeed = useRef(0.5);
  const targetScale = useRef(new THREE.Vector3(1, 1, 1));
  const speakingAmplitude = useRef(0);

  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].sender === "user"
    ) {
      rotationSpeed.current = 2;
      setTimeout(() => {
        rotationSpeed.current = 0.5;
      }, 1000);
    }
  }, [messages]);

  useFrame((state, delta) => {
    if (modelRef.current) {
      // Rotate the model
      modelRef.current.rotation.y += delta * rotationSpeed.current;

      // Scale the model based on chat open state
      const targetScaleValue = isChatOpen ? 1.2 : 1;
      targetScale.current.setScalar(targetScaleValue);
      modelRef.current.scale.lerp(targetScale.current, 0.1);

      // Animate speaking
      if (isProcessing) {
        speakingAmplitude.current = THREE.MathUtils.lerp(
          speakingAmplitude.current,
          0.2,
          0.1
        );
      } else {
        speakingAmplitude.current = THREE.MathUtils.lerp(
          speakingAmplitude.current,
          0,
          0.1
        );
      }

      // Apply speaking animation
      modelRef.current.scale.y =
        targetScale.current.y +
        Math.sin(state.clock.elapsedTime * 10) * speakingAmplitude.current;

      // Subtle floating animation
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      <primitive
        object={scene}
        ref={modelRef}
        position={[0, -1, 0]}
        scale={[1, 1, 1]}
      />
    </group>
  );
}

// Preload the model to improve performance
useGLTF.preload("/assets/3d/duck.glb");
useGLTF.preload("/assets/3d/robot.glb");
useGLTF.preload("/assets/3d/cat.glb");
