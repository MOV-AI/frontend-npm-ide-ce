import { Subject } from "rxjs";

/**
 * BaseMode is the default mode strutucte
 * @param {string} id name of the mode
 */

const BaseMode = function (id) {
  return {
    id: id,
    onEnter: new Subject(),
    onExit: new Subject(),
    props: null
  };
};

const _AddNodeMode = function () {
  return {
    onClick: new Subject()
  };
};

/**
 * AddNodeMode is a custom mode extended from BaseMode and _AddNodeMode
 * @param {string} id name of the mode
 */
const AddNodeMode = function (id) {
  return Object.assign(BaseMode(id), _AddNodeMode());
};

const _DragMode = function () {
  return {
    onDrag: new Subject()
  };
};

const DragMode = function (id) {
  return Object.assign(BaseMode(id), _DragMode());
};

const _LinkingMode = function () {
  return {
    onClick: new Subject(),
    onMouseMove: new Subject()
  };
};

const LinkingMode = function (id) {
  return Object.assign(BaseMode(id), _LinkingMode());
};

export { BaseMode, AddNodeMode, DragMode, LinkingMode };
