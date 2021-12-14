import Vec2 from "../../../Viewer3d/Math/Vec2";
import { Maybe } from "monet";

//========================================================================================
/*                                                                                      *
 *                                    PATH FUNCTIONS                                    *
 *                                                                                      */
//========================================================================================

export const relaxPath = (src, trg) => {
  const n = 15;
  const shift = Vec2.of(13, 3);
  const { x0, x1, xSc, xTc, srcSize, trgSize } = getBaseVars(src, trg);
  const lowerCornerSrc = xSc.sub(srcSize.scale(0.5)).add(shift);
  const upperCornerSrc = lowerCornerSrc.add(srcSize);
  const srcBox = box(lowerCornerSrc, upperCornerSrc);

  const lowerCornerTrg = xTc.sub(trgSize.scale(0.5)).add(shift);
  const upperCornerTrg = lowerCornerTrg.add(trgSize);
  const trgBox = box(lowerCornerTrg, upperCornerTrg);

  let ans = [...Array(n)].map((_, i) => i).map(i => lerp(x0, x1, i / (n - 1)));
  let t = 50;
  let dt = 0.05;
  while (t > 0) {
    const pathVel = relaxSpeed(ans, srcBox, trgBox);
    ans = ans.map((p, i) => p.add(pathVel[i].scale(dt)));
    t--;
  }
  return ans.map(z => z.toObject());
};

export const orthoPath = (src, trg) => {
  const sigma = 0.5;
  const MIN_DISTANCE_TO_LINE = 50;
  const { x0, x1, xSc, xTc, srcSize, trgSize, isLink } = getBaseVars(src, trg);

  if (isFeedBack(xSc, xTc, isLink)) return simplePotentialV(src, trg);

  let x01 = handleInOut(x0, srcSize, src);
  let x11 = handleInOut(x1, trgSize, trg);

  if (x01.sub(x11).length() < MIN_DISTANCE_TO_LINE) return linePath(src, trg);
  const dx0 = x01.sub(x0);
  const dx01 = x11.sub(x01);
  const dot0 = dx0.dot(dx01);
  const proj0 = dx0.scale(dot0 / dx0.dot(dx0));
  let ortho0 = dx01.sub(proj0).normalize();
  const pinSrcV = x0.sub(xSc);
  const projPin0 = ortho0.dot(pinSrcV);
  const projPinSrcV = ortho0.scale(projPin0);
  const halveHSrc = srcSize.y / 2;
  const ratio0 = projPinSrcV.length() / halveHSrc;
  ortho0 =
    projPin0 < 0
      ? ortho0.scale(2 * halveHSrc * (1 - ratio0) * sigma)
      : ortho0.scale(halveHSrc * (1 - ratio0));
  const x02 = x01.add(ortho0);

  const dx1 = x11.sub(x1);
  const dx11 = x01.sub(x11);
  const dot1 = dx1.dot(dx11);
  const proj1 = dx1.scale(dot1 / dx1.dot(dx1));
  let ortho1 = dx11.sub(proj1).normalize();
  const pinTrgV = x1.sub(xTc);
  const projPin1 = ortho1.dot(pinTrgV);
  const projPinTrgV = ortho1.scale(projPin1);
  const halveHTrg = trgSize.y / 2;
  const ratio1 = projPinTrgV.length() / halveHTrg;
  ortho1 =
    projPin1 < 0
      ? ortho1.scale(2 * halveHTrg * (1 - ratio1) * sigma)
      : ortho1.scale(halveHTrg * (1 - ratio1));
  const x12 = x11.add(ortho1);

  const ans = [x0, x01];
  const dx2 = x12.sub(x02);
  const isEntangled =
    dx2.dot(ortho0) < 0 && dx2.length() < 4 * MIN_DISTANCE_TO_LINE;
  if (dot0 < 0 && !isEntangled) ans.push(x02);
  if (dot1 < 0 && !isEntangled) ans.push(x12);
  ans.push(x11, x1);
  return ans.map(z => z.toObject());
};

export const linePath = (src, trg) => {
  const x0 = new Vec2(src.x, src.y);
  const x1 = new Vec2(trg.x, trg.y);
  return [x0, x1].map(z => z.toObject());
};

export const manhattanPath = (src, trg) => {
  const { x0, x1, xIn, xOut, srcSize, trgSize } = getBaseVars(src, trg);
  const dx = x1.sub(x0);
  const dot = dx.dot(Vec2.e2);
  const angle = Math.abs(Math.acos(dot / dx.length()));
  const isLine =
    angle < (7 * Math.PI) / 8 && angle > Math.PI / 8 && dx.dot(Vec2.e1) > 0;
  const dir = isLine ? Vec2.ZERO : Vec2.e2.scale(Math.sign(dot));
  return [
    x0,
    xOut,
    xOut.add(dir.scale(srcSize.y)),
    xIn.add(dir.scale(-trgSize.y)),
    xIn,
    x1
  ].map(z => z.toObject());
};

export const fuzzyManhattanPath = (src, trg) => {
  const noise = 3;
  const sigma = 1.5;

  const { x0, x1, xIn, xOut, srcSize, trgSize } = getBaseVars(src, trg);
  const dx = x1.sub(x0);
  const dInOut = xIn.sub(xOut);
  const dInOutDual = dInOut.dual().normalize();

  const dot = dx.dot(Vec2.e2);
  const angle = Math.abs(Math.acos(dot / dx.length()));
  const isLine =
    angle < (7 * Math.PI) / 8 && angle > Math.PI / 8 && dx.dot(Vec2.e1) > 0;

  return [
    x0,
    xOut,
    xOut.add(
      isLine
        ? dInOut
            .scale(Math.random() / 2)
            .add(dInOutDual.scale(-noise + 2 * noise * Math.random()))
        : Vec2.e2.scale(Math.sign(dot) * srcSize.y * sigma)
    ),
    xIn.add(
      isLine
        ? dInOut
            .scale(-Math.random() / 2)
            .add(dInOutDual.scale(-noise + 2 * noise * Math.random()))
        : Vec2.e2.scale(Math.sign(dot) * -trgSize.y * sigma)
    ),
    xIn,
    x1
  ].map(z => z.toObject());
};

export const simplePotentialV = (src, trg) => {
  const tooCloseDistance = 50;
  const iterator = {
    getInitialState: ({ xOut }) => ({ x: xOut }),
    updateState: (state, force, dt) => {
      state.x = state.x.add(force.scale(dt));
      return state;
    },
    isFinalState: (state, { xIn }) =>
      state.x.sub(xIn).length() > tooCloseDistance
  };
  return potential(src, trg, iterator);
};

export const simplePotentialA = (src, trg) => {
  const tooCloseDistance = 50;
  const iterator = {
    getInitialState: ({ xOut }) => ({ x: xOut, v: Vec2.e1 }),
    updateState: (state, force, dt) => {
      state.v = state.v.add(force.scale(dt));
      state.x = state.x.add(state.v.scale(dt));
      return state;
    },
    isFinalState: (state, { xIn }) =>
      state.x.sub(xIn).length() > tooCloseDistance
  };
  return potential(src, trg, iterator);
};

//========================================================================================
/*                                                                                      *
 *                                         UTILS                                        *
 *                                                                                      */
//========================================================================================

const relaxSpeed = (path, srcBox, trgBox) => {
  let speed = [...Array(path.length)];
  const boxForce = (p, box) => {
    const dist2Box = box.sdf(p);
    const grad = box.grad(p);
    return grad.scale(200 / dist2Box);
  };
  // assumes path length > 3
  for (let i = 1; i < path.length - 1; i++) {
    const f = path[i];
    const df = path[i + 1].sub(f.scale(2)).add(path[i - 1]);
    const srcF = boxForce(f, srcBox);
    const trgF = boxForce(f, trgBox);
    speed[i] = df.add(srcF).add(trgF);
  }
  speed[0] = Vec2.ZERO;
  speed[path.length - 1] = Vec2.ZERO;
  return speed;
};

const potential = (
  src,
  trg,
  { getInitialState, updateState, isFinalState }
) => {
  const maxIte = 200;
  const q = 1000;
  const dtBound = bound(0.1, 1);
  const sidePoints = [];
  const potentialVars = getBaseVars(src, trg);
  const { x0, x1, xIn, xOut, xSc, srcSize, trgSize } = potentialVars;
  const d0 = x => x.sub(xSc).length() - srcSize.x / 3;
  const d1 = x => x.sub(xIn).length() - trgSize.x / 3;

  const forceSrc = x => x.sub(xSc).scale((5 * q) / (d0(x) * d0(x)));
  const forceTrg = x => x.sub(xIn).scale((10 * -q) / (d1(x) * d1(x)));

  let n = 0;
  let dt = 0.1;
  let oldForce = Vec2.ZERO;
  let state = getInitialState(potentialVars);
  sidePoints.push(x0.toObject(), xOut.toObject());
  while (n++ < maxIte && isFinalState(state, potentialVars)) {
    const force = forceSrc(state.x).add(forceTrg(state.x));
    dt = dtBound(1 / force.sub(oldForce).length());
    oldForce = force;
    state = updateState(state, force, dt);
    sidePoints.push(state.x.toObject());
  }
  sidePoints.push(xIn.toObject(), x1.toObject());
  return sidePoints;
};

const getBaseVars = (src, trg) => {
  const src_ = defaultNode(src);
  const trg_ = defaultNode(trg);
  const srcSize = new Vec2(src_.nodeSize.width, src_.nodeSize.height);
  const trgSize = new Vec2(trg_.nodeSize.width, trg_.nodeSize.height);

  const xSc = new Vec2(src_.center.xCenter, src_.center.yCenter);
  const xTc = new Vec2(trg_.center.xCenter, trg_.center.yCenter);

  const x0 = new Vec2(src_.x, src_.y);
  const x1 = new Vec2(trg_.x, trg_.y);

  const xIn = x1.sub(new Vec2(trgSize.x / 2, 0));
  const xOut = x0.add(new Vec2(srcSize.x / 2, 0));

  return { x0, x1, xIn, xOut, xSc, xTc, srcSize, trgSize, isLink: trg_.isLink };
};

const bound = (min, max) => x => Math.max(min, Math.min(max, x));

// Assumes node.x && node.y !== null
const defaultNode = node => ({
  ...node,
  center: Maybe.fromNull(node.center).orSome({
    xCenter: node.x,
    yCenter: node.y
  }),
  nodeSize: Maybe.fromNull(node.nodeSize).orSome({
    width: 1,
    height: 1
  }),
  isLink: node.center ? false : true
});

const lerp = (x, y, t = 0) => {
  const dx = y.sub(x);
  return x.add(dx.scale(t));
};

const box = (min, max) => {
  min = min.op(max, Math.min);
  max = max.op(min, Math.max);
  const center = min.add(max).scale(1 / 2);
  const diagonal = max.sub(min);
  const width = diagonal.x;
  const height = diagonal.y;
  const sdf = x => {
    let v = x.sub(center);
    v = v.map(z => Math.abs(z));
    v = v.sub(Vec2.of(width, height).scale(0.5));
    v = v.map(z => Math.max(z, 0));
    return v.length();
  };
  const grad = (x, epsilon = 1e-2) => {
    const f = sdf(x);
    const xh = x.add(Vec2.e1.scale(epsilon));
    const yh = x.add(Vec2.e2.scale(epsilon));
    return Vec2.of(sdf(xh), sdf(yh))
      .sub(Vec2.of(f, f))
      .scale(1 / epsilon);
  };
  return {
    min,
    max,
    center,
    diagonal,
    width,
    height,
    sdf,
    grad
  };
};

const handleInOut = (x, size, node) => {
  let y = x;
  if (node.data.type === "In") {
    y = x.sub(new Vec2(size.x / 2, 0));
  } else if (node.data.type === "Out") {
    y = x.add(new Vec2(size.x / 2, 0));
  }
  return y;
};

const isFeedBack = (xSc, xTc, isLink) => {
  const length = xTc.sub(xSc).length();
  return !isLink && length < 50;
};
