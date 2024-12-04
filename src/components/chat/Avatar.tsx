import React, { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import { AvatarModel } from "./AvatarModel";
import { ChatInterface } from "./ChatInterface";
import { useAvatarStore } from "@/stores/avatar";
import { PerspectiveCamera, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";

const avatarModels = [
  { name: "Duck", url: "/assets/3d/duck.glb" },
  { name: "Robot", url: "/assets/3d/robot.glb" },
  { name: "Cat", url: "/assets/3d/cat.glb" },
];

export function GlobalAvatar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    position,
    modelUrl,
    isChatOpen,
    setPosition,
    toggleChat,
    setModelUrl,
    isDragging,
    setIsDragging,
  } = useAvatarStore();

  const bind = useDrag(
    ({ offset: [x, y], first, last }) => {
      if (first) setIsDragging(true);
      if (last) setIsDragging(false);

      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const newX = Math.max(0, Math.min(x, clientWidth - 180));
        const newY = Math.max(0, Math.min(y, clientHeight - 180));
        setPosition([
          (newX / clientWidth) * 2 - 1,
          -(newY / clientHeight) * 2 + 1,
          0,
        ]);
      }
    },
    { filterTaps: true }
  );

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setPosition([
          Math.max(-1, Math.min(1, position[0])),
          Math.max(-1, Math.min(1, position[1])),
          0,
        ]);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, setPosition]);

  const handleAvatarClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      toggleChat();
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 pointer-events-none">
      <div
        {...bind()}
        className="absolute cursor-move pointer-events-auto"
        style={{
          left: `${((position[0] + 1) / 2) * 100}%`,
          top: `${((1 - position[1]) / 2) * 100}%`,
          transform: "translate(-50%, -50%)",
          width: "180px",
          height: "180px",
          zIndex: 1000,
        }}
      >
        <div className="w-full h-full" onClick={handleAvatarClick}>
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <Environment preset="studio" />
            <AvatarModel url={modelUrl} />
          </Canvas>
        </div>
      </div>
      {isChatOpen && (
        <div
          className="absolute bg-background rounded-lg shadow-lg pointer-events-auto"
          style={{
            left: `${((position[0] + 1) / 2) * 100}%`,
            top: `${((1 - position[1]) / 2) * 100}%`,
            transform: "translate(-50%, -100%) translateY(-20px)",
            width: "300px",
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "calc(100vh - 40px)",
            overflow: "auto",
            zIndex: 1001,
          }}
        >
          <ChatInterface />
        </div>
      )}
    </div>
  );
}
