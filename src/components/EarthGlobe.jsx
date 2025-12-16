import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 简单的地球颜色数据（简化版）
const createEarthTexture = () => {
  const canvas = document.createElement('canvas');
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // 背景蓝色（海洋）
  ctx.fillStyle = '#1e88e5';
  ctx.fillRect(0, 0, size, size);
  
  // 添加一些绿色区域（大陆）
  ctx.fillStyle = '#388e3c';
  
  // 北美
  ctx.beginPath();
  ctx.ellipse(size * 0.3, size * 0.4, size * 0.15, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 南美
  ctx.beginPath();
  ctx.ellipse(size * 0.35, size * 0.7, size * 0.1, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 欧洲/非洲
  ctx.beginPath();
  ctx.ellipse(size * 0.6, size * 0.5, size * 0.12, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 亚洲
  ctx.beginPath();
  ctx.ellipse(size * 0.75, size * 0.45, size * 0.18, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // 澳大利亚
  ctx.beginPath();
  ctx.ellipse(size * 0.8, size * 0.7, size * 0.08, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas;
};

const EarthGlobe = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // 检查WebGL支持
    if (!window.WebGLRenderingContext) {
      console.error('WebGL not supported');
      return;
    }

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 创建地球几何体
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    
    // 使用自定义地球纹理
    const earthCanvas = createEarthTexture();
    const texture = new THREE.CanvasTexture(earthCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 15,
      specular: new THREE.Color(0xffffff)
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, -5);
    scene.add(pointLight);

    // 添加星星背景
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 200;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      sizeAttenuation: false
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // 旋转和缩放状态
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };
    let zoom = 3; // 初始缩放距离

    // 鼠标事件处理
    const handleMouseDown = (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      mountRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      
      // 限制垂直旋转
      rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotation.x));
      
      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      mountRef.current.style.cursor = 'grab';
    };

    // 鼠标滚轮缩放
    const handleWheel = (event) => {
      event.preventDefault();
      const wheelDelta = event.deltaY > 0 ? 1 : -1;
      zoom += wheelDelta * 0.2;
      // 限制缩放范围
      zoom = Math.max(1.5, Math.min(8, zoom));
      camera.position.z = zoom;
    };

    // 触摸事件处理
    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { 
          x: event.touches[0].clientX, 
          y: event.touches[0].clientY 
        };
        mountRef.current.style.cursor = 'grabbing';
        event.preventDefault();
      }
    };

    const handleTouchMove = (event) => {
      if (!isDragging || event.touches.length !== 1) return;
      
      const deltaX = event.touches[0].clientX - previousMousePosition.x;
      const deltaY = event.touches[0].clientY - previousMousePosition.y;
      
      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      
      rotation.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotation.x));
      
      previousMousePosition = { 
        x: event.touches[0].clientX, 
        y: event.touches[0].clientY 
      };
      event.preventDefault();
    };

    const handleTouchEnd = () => {
      isDragging = false;
      mountRef.current.style.cursor = 'grab';
    };

    // 添加事件监听器
    const canvasEl = renderer.domElement;
    canvasEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvasEl.addEventListener('wheel', handleWheel, { passive: false });
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // 自动缓慢旋转（仅在不拖拽时）
      if (!isDragging) {
        earth.rotation.y += 0.001;
      }
      
      // 应用手动旋转
      earth.rotation.x = rotation.x;
      earth.rotation.y += rotation.y;
      rotation.y = 0;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // 窗口大小调整
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // 清理
    return () => {
      cancelAnimationFrame(animationId);
      canvasEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvasEl.removeEventListener('wheel', handleWheel);
      canvasEl.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        cursor: 'grab'
      }}
    />
  );
};

export default EarthGlobe;