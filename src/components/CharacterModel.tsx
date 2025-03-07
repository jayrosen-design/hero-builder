
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { CharacterState } from '../hooks/useCharacterCustomization';

interface CharacterModelProps {
  character: CharacterState;
  isGameMode?: boolean;
  isRotating?: boolean;
  controls?: any;
  isAbilityActive?: boolean;
}

const CharacterModel: React.FC<CharacterModelProps> = ({
  character,
  isGameMode = false,
  isRotating = true,
  controls,
  isAbilityActive = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const orbitControlsRef = useRef<any | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const groundRef = useRef<THREE.Mesh | null>(null);
  const coinsRef = useRef<THREE.Object3D[]>([]);
  const platformsRef = useRef<THREE.Mesh[]>([]);
  
  const cleanupAnimationFrame = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    console.log("Setting up Three.js scene, game mode:", isGameMode);
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    
    camera.position.set(0, 2, 7);
    camera.lookAt(0, 1, 0);
    
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x87CEEB, 1);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 5, 1);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    const characterGroup = new THREE.Group();
    characterRef.current = characterGroup;
    scene.add(characterGroup);
    
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3a8c3a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);
    groundRef.current = ground;
    
    // Add platforms and store references to them
    platformsRef.current = [];
    
    if (controls && controls.platforms) {
      controls.platforms.forEach((platformData, index) => {
        // Skip the main ground platform for rendering purposes
        if (platformData.width >= 50) return;
        
        // Skip broken platforms
        if (platformData.broken) return;
        
        const platform = addPlatform(
          scene, 
          platformData.x, 
          platformData.y, 
          platformData.z, 
          platformData.width, 
          platformData.height, 
          platformData.depth, 
          new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.8,
            metalness: 0.2
          })
        );
        
        platformsRef.current.push(platform);
      });
    } else {
      // Add default platforms if no controls provided
      platformsRef.current.push(
        addPlatform(scene, -5, 0, -10, 5, 0.5, 5, new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.8,
          metalness: 0.2
        }))
      );
      
      platformsRef.current.push(
        addPlatform(scene, 8, 2, -8, 5, 0.5, 5, new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.8,
          metalness: 0.2
        }))
      );
      
      platformsRef.current.push(
        addPlatform(scene, 0, 4, -15, 5, 0.5, 5, new THREE.MeshStandardMaterial({ 
          color: 0x8B4513,
          roughness: 0.8,
          metalness: 0.2
        }))
      );
    }
    
    if (controls && controls.coinObjects) {
      addCoins(scene, controls.coinObjects);
    }
    
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (isRotating && !controls && characterRef.current) {
        characterRef.current.rotation.y += 0.01;
      }
      
      if (controls && characterRef.current && cameraRef.current) {
        characterRef.current.position.set(
          controls.position.x,
          controls.position.y, 
          controls.position.z
        );
        characterRef.current.rotation.y = controls.rotation;
        
        if (controls.coinObjects) {
          updateCoins(controls.coinObjects);
        }
        
        if (controls.platforms) {
          updatePlatforms(controls.platforms);
        }
        
        const cameraOffset = new THREE.Vector3(0, 2, 5);
        const characterPosition = new THREE.Vector3(
          controls.position.x,
          controls.position.y,
          controls.position.z
        );
        
        cameraRef.current.position.copy(characterPosition).add(cameraOffset);
        cameraRef.current.lookAt(
          controls.position.x,
          controls.position.y + 1,
          controls.position.z
        );
      }
      
      if (coinsRef.current.length > 0) {
        coinsRef.current.forEach((coin, index) => {
          if (coin.visible) {
            coin.rotation.y += 0.02;
            coin.position.y += Math.sin(Date.now() * 0.002 + index) * 0.001;
          }
        });
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      console.log("Cleaning up Three.js scene");
      cleanupAnimationFrame();
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [isGameMode, isRotating, controls]);
  
  function addPlatform(
    scene: THREE.Scene, 
    x: number, 
    y: number, 
    z: number, 
    width: number, 
    height: number, 
    depth: number,
    material: THREE.Material
  ) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const platform = new THREE.Mesh(geometry, material);
    platform.position.set(x, y, z);
    platform.castShadow = true;
    platform.receiveShadow = true;
    scene.add(platform);
    return platform;
  }
  
  function updatePlatforms(platformsData: any[]) {
    // For each platform in the controls data
    platformsData.forEach((platformData, index) => {
      // Skip the ground platform
      if (platformData.width >= 50) return;
      
      // Find the corresponding mesh in our references
      const platformIndex = platformsRef.current.findIndex(platform => {
        const position = platform.position;
        return (
          Math.abs(position.x - platformData.x) < 0.1 &&
          Math.abs(position.y - platformData.y) < 0.1 &&
          Math.abs(position.z - platformData.z) < 0.1
        );
      });
      
      // If the platform is broken and we have a mesh reference, remove it
      if (platformData.broken && platformIndex >= 0) {
        console.log("Removing broken platform from scene");
        const platform = platformsRef.current[platformIndex];
        if (sceneRef.current && platform.parent === sceneRef.current) {
          sceneRef.current.remove(platform);
          // Remove from our references array
          platformsRef.current = platformsRef.current.filter((_, i) => i !== platformIndex);
        }
      }
    });
  }
  
  function addCoins(scene: THREE.Scene, coinObjects: any[]) {
    coinsRef.current = [];
    
    const coinGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
    const coinMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 1,
      roughness: 0.3,
      emissive: 0xFFD700,
      emissiveIntensity: 0.2
    });
    
    coinObjects.forEach((coinData, index) => {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.rotation.x = Math.PI / 2;
      coin.position.set(coinData.x, coinData.y, coinData.z);
      coin.castShadow = true;
      coin.visible = !coinData.collected;
      coin.userData = { id: coinData.id };
      scene.add(coin);
      coinsRef.current.push(coin);
    });
  }
  
  function updateCoins(coinObjects: any[]) {
    coinObjects.forEach(coinData => {
      const coin = coinsRef.current.find(c => c.userData.id === coinData.id);
      if (coin) {
        // Update position if the coin is being attracted by magic
        coin.position.set(coinData.x, coinData.y, coinData.z);
        coin.visible = !coinData.collected;
      }
    });
  }
  
  useEffect(() => {
    if (!characterRef.current || !sceneRef.current) return;
    
    console.log("Updating character model with:", character);
    
    while (characterRef.current.children.length > 0) {
      const object = characterRef.current.children[0];
      characterRef.current.remove(object);
    }
    
    let headGeometry;
    switch (character.head) {
      case 'head-1':
        headGeometry = new THREE.ConeGeometry(0.5, 0.8, 8);
        break;
      case 'head-2':
        headGeometry = new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        break;
      case 'head-3':
        headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        break;
      default:
        headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    }
    
    const headMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.head),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    head.castShadow = true;
    characterRef.current.add(head);
    
    let torsoGeometry;
    switch (character.torso) {
      case 'torso-1':
        torsoGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.6);
        break;
      case 'torso-2':
        torsoGeometry = new THREE.CylinderGeometry(0.5, 0.7, 1.5, 8);
        break;
      case 'torso-3':
        torsoGeometry = new THREE.CapsuleGeometry(0.6, 0.3, 4, 8);
        break;
      default:
        torsoGeometry = new THREE.BoxGeometry(1, 1.5, 0.5);
    }
    
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.torso),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.y = 0.4;
    torso.castShadow = true;
    characterRef.current.add(torso);
    
    let armGeometry;
    switch (character.arms) {
      case 'arms-1':
        armGeometry = new THREE.CylinderGeometry(0.2, 0.25, 1, 8);
        break;
      case 'arms-2':
        armGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        break;
      case 'arms-3':
        armGeometry = new THREE.CapsuleGeometry(0.15, 0.7, 4, 8);
        break;
      default:
        armGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
    }
    
    const armMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.arms),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const armScale = (character.superAbility === 'strength' && isAbilityActive) ? 1.4 : 1;
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.7, 0.4, 0);
    leftArm.scale.set(armScale, armScale, armScale);
    leftArm.rotation.z = Math.PI / 12;
    leftArm.castShadow = true;
    characterRef.current.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.7, 0.4, 0);
    rightArm.scale.set(armScale, armScale, armScale);
    rightArm.rotation.z = -Math.PI / 12;
    rightArm.castShadow = true;
    characterRef.current.add(rightArm);
    
    let legGeometry;
    switch (character.legs) {
      case 'legs-1':
        legGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
        break;
      case 'legs-2':
        legGeometry = new THREE.BoxGeometry(0.3, 1, 0.3);
        break;
      case 'legs-3':
        legGeometry = new THREE.CapsuleGeometry(0.2, 0.6, 4, 8);
        break;
      default:
        legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
    }
    
    const legMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(character.colors.legs),
      roughness: 0.7,
      metalness: 0.3
    });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -0.6, 0);
    leftLeg.castShadow = true;
    characterRef.current.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -0.6, 0);
    rightLeg.castShadow = true;
    characterRef.current.add(rightLeg);
    
    if (character.superAbility && isAbilityActive) {
      switch (character.superAbility) {
        case 'flying':
          const capeGeometry = new THREE.PlaneGeometry(1.5, 2);
          const capeMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#ff3333'),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9,
          });
          const cape = new THREE.Mesh(capeGeometry, capeMaterial);
          cape.position.set(0, 0.4, 0.4); // Moved down to the top of the torso
          cape.rotation.x = -Math.PI / 6;
          characterRef.current.add(cape);
          break;
          
        case 'magic':
          const glowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
          const glowMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color('#33ccff'),
            emissive: new THREE.Color('#33ccff'),
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.8
          });
          
          const leftGlow = new THREE.Mesh(glowGeometry, glowMaterial);
          leftGlow.position.set(-0.7, -0.1, 0);
          characterRef.current.add(leftGlow);
          
          const rightGlow = new THREE.Mesh(glowGeometry, glowMaterial);
          rightGlow.position.set(0.7, -0.1, 0);
          characterRef.current.add(rightGlow);
          break;
          
        default:
          break;
      }
    }
    
    if (isGameMode && controls) {
      characterRef.current.position.set(controls.position.x, controls.position.y, controls.position.z);
      characterRef.current.rotation.y = controls.rotation;
    } else {
      characterRef.current.position.set(0, 0, 0);
    }
  }, [character, isGameMode, controls, isAbilityActive]);
  
  useEffect(() => {
    if (isGameMode && controls && characterRef.current) {
      characterRef.current.position.set(controls.position.x, controls.position.y, controls.position.z);
      characterRef.current.rotation.y = controls.rotation;
    }
  }, [isGameMode, controls]);
  
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${isAbilityActive ? getAbilityClass() : ''}`}
      style={{ backgroundColor: '#87CEEB' }}
    />
  );
  
  function getAbilityClass() {
    if (!isAbilityActive || !character.superAbility) return '';
    return `hero-${character.superAbility}`;
  }
};

export default CharacterModel;
