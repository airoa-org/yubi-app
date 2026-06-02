export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ROS TF Visualizer</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; }
    body { font-family: monospace; }
    #container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      padding: 6px 10px;
      border-radius: 5px;
      font-size: 12px;
      color: #fff;
      z-index: 10;
    }
    #status { color: #f90; }
    #status.connected { color: #0f0; }
    #axes-container {
      position: absolute;
      bottom: 10px;
      right: 10px;
      z-index: 10;
    }
    #axes-canvas {
      display: block;
      border: 1px solid #444;
      background: rgba(0,0,0,0.5);
    }
    #axes-label {
      position: absolute;
      top: 4px;
      left: 4px;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
    }
  </style>
</head>
<body>
  <div id="container">
    <div id="info">
      <span id="status">Disconnected</span>
    </div>
    <div id="axes-container">
      <span id="axes-label">three.js</span>
      <canvas id="axes-canvas" width="120" height="120"></canvas>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/roslib@1.4.0/build/roslib.min.js"></script>
  <script type="importmap">
    {
      "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.182.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.182.0/examples/jsm/"
      }
    }
  </script>

  <script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

    const container = document.getElementById('container');
    const statusEl = document.getElementById('status');

    function getSize() {
      return { width: container.clientWidth, height: container.clientHeight };
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    let { width, height } = getSize();

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
    camera.position.set(-1.0, 0.5, 0);
    camera.lookAt(0, -0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.insertBefore(renderer.domElement, container.firstChild);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, -0.5, 0);

    window.addEventListener('resize', () => {
      const { width: w, height: h } = getSize();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });

    const axesCanvas = document.getElementById('axes-canvas');
    const axesRenderer = new THREE.WebGLRenderer({ canvas: axesCanvas, antialias: true, alpha: true });
    axesRenderer.setSize(120, 120);
    axesRenderer.setClearColor(0x000000, 0.5);
    const axesScene = new THREE.Scene();
    const axesCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
    axesCamera.position.set(0, 0, 3);
    axesScene.add(new THREE.AxesHelper(1));

    const rosRoot = new THREE.Group();
    rosRoot.rotation.x = -Math.PI / 2;
    scene.add(rosRoot);

    const rosWorldAxes = new THREE.AxesHelper(1);
    rosRoot.add(rosWorldAxes);

    // ============================================
    // Frame management
    // ============================================
    const frames = {};
    const TRAIL_DURATION_SEC = 1.0;
    const HIDDEN_FRAME_PATTERN = /camera/i;

    function createAxisHelper(size = 0.1) {
      const group = new THREE.Group();
      const materials = [
        new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
        new THREE.MeshBasicMaterial({ color: 0x0000ff }),
      ];
      const arrowLength = size;
      const arrowRadius = size * 0.05;
      const directions = [
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 1),
      ];
      directions.forEach((dir, i) => {
        const geometry = new THREE.CylinderGeometry(arrowRadius, arrowRadius, arrowLength, 8);
        const mesh = new THREE.Mesh(geometry, materials[i]);
        mesh.position.copy(dir.clone().multiplyScalar(arrowLength / 2));
        if (i === 0) mesh.rotation.z = -Math.PI / 2;
        if (i === 2) mesh.rotation.x = Math.PI / 2;
        group.add(mesh);
      });
      return group;
    }

    function createFrameLabel(text) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px monospace';
      ctx.fillText(text, 5, 40);
      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(0.3, 0.075, 1);
      sprite.position.set(0.05, 0.05, 0);
      return sprite;
    }

    function createTrailPoints() {
      const geometry = new THREE.BufferGeometry();
      const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
        sizeAttenuation: true,
      });
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      return points;
    }

    function getOrCreateFrame(frameId) {
      if (!frames[frameId]) {
        const group = new THREE.Group();
        group.name = frameId;
        group.add(createAxisHelper(0.1));
        group.add(createFrameLabel(frameId));
        const trailPoints = createTrailPoints();
        scene.add(trailPoints);
        const isHidden = HIDDEN_FRAME_PATTERN.test(frameId);
        if (isHidden) {
          group.visible = false;
          trailPoints.visible = false;
        }
        rosRoot.add(group);
        frames[frameId] = {
          object: group,
          parent: null,
          trail: [],
          trailPoints,
          lastPosition: null,
          lastTime: null,
          hidden: isHidden,
        };
      }
      return frames[frameId];
    }

    // ============================================
    // ROS connection
    // ============================================
    let ros = null;

    function connect(url) {
      if (ros) { ros.close(); }
      ros = new ROSLIB.Ros({ url });
      ros.on('connection', () => {
        statusEl.textContent = 'Connected to ' + url;
        statusEl.className = 'connected';
        subscribeTF();
      });
      ros.on('error', () => {
        statusEl.textContent = 'Error';
        statusEl.className = '';
      });
      ros.on('close', () => {
        statusEl.textContent = 'Disconnected';
        statusEl.className = '';
      });
    }

    function subscribeTF() {
      const tfTopic = new ROSLIB.Topic({ ros, name: '/tf', messageType: 'tf2_msgs/TFMessage' });
      const tfStaticTopic = new ROSLIB.Topic({ ros, name: '/tf_static', messageType: 'tf2_msgs/TFMessage' });

      const handleTF = (message) => {
        const now = performance.now() / 1000;
        message.transforms.forEach((tf) => {
          const frame = getOrCreateFrame(tf.child_frame_id);
          const parentFrame = getOrCreateFrame(tf.header.frame_id);
          const t = tf.transform.translation;
          const r = tf.transform.rotation;
          frame.object.position.set(t.x, t.y, t.z);
          frame.object.quaternion.set(r.x, r.y, r.z, r.w);
          const worldPos = new THREE.Vector3();
          frame.object.getWorldPosition(worldPos);
          frame.trail.push({ time: now, position: worldPos });
          frame.lastPosition = worldPos.clone();
          frame.lastTime = now;
          if (frame.parent !== tf.header.frame_id) {
            if (frame.object.parent !== rosRoot) { frame.object.parent.remove(frame.object); }
            parentFrame.object.add(frame.object);
            frame.parent = tf.header.frame_id;
          }
        });
      };

      tfTopic.subscribe(handleTF);
      tfStaticTopic.subscribe(handleTF);
    }

    // ============================================
    // Animation loop
    // ============================================
    function updateTrails() {
      const now = performance.now() / 1000;
      const cutoff = now - TRAIL_DURATION_SEC;
      for (const frameId in frames) {
        const frame = frames[frameId];
        if (frame.hidden) continue;
        while (frame.trail.length > 0 && frame.trail[0].time < cutoff) { frame.trail.shift(); }
        if (frame.trail.length >= 1) {
          const positions = new Float32Array(frame.trail.length * 3);
          const colors = new Float32Array(frame.trail.length * 3);
          frame.trail.forEach((point, i) => {
            positions[i * 3] = point.position.x;
            positions[i * 3 + 1] = point.position.y;
            positions[i * 3 + 2] = point.position.z;
            const alpha = 1.0 - ((now - point.time) / TRAIL_DURATION_SEC);
            colors[i * 3] = alpha;
            colors[i * 3 + 1] = alpha;
            colors[i * 3 + 2] = 0;
          });
          frame.trailPoints.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          frame.trailPoints.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
          frame.trailPoints.visible = true;
        } else {
          frame.trailPoints.visible = false;
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      updateTrails();
      renderer.render(scene, camera);
      axesCamera.position.copy(camera.position).normalize().multiplyScalar(3);
      axesCamera.lookAt(0, 0, 0);
      axesRenderer.render(axesScene, axesCamera);
    }
    animate();

    const urlParams = new URLSearchParams(window.location.search);
    connect(urlParams.get('wsUrl') ?? 'ws://localhost:9090');

  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  });
}
