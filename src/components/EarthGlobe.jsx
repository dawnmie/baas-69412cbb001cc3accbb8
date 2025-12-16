import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    camera.position.z = 2.5;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 创建地球几何体
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // 创建渐变材质（模拟地球）
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // 创建径向渐变
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#1e88e5');
    gradient.addColorStop(0.3, '#29b6f6');
    gradient.addColorStop(0.7, '#0288d1');
    gradient.addColorStop(1, '#01579b');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 30,
      specular: new THREE.Color(0xffffff)
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(2, 1, 3);
    scene.add(directionalLight);

    // 旋转状态
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotation = { x: 0, y: 0 };

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
    canvasEl.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // 动画循环
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // 自动缓慢旋转
      earth.rotation.y += 0.001;
      
      // 应用手动旋转
      earth.rotation.x = rotation.x;
      earth.rotation.y += rotation.y;
      rotation.y = 0; // 重置手动旋转增量
      
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