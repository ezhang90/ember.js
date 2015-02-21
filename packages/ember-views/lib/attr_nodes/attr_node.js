/**
@module ember
@submodule ember-htmlbars
*/

import {
  read,
  subscribe,
  unsubscribe
} from "ember-metal/streams/utils";
import run from "ember-metal/run_loop";

function AttrNode(attrName, attrValue) {
  this.init(attrName, attrValue);
}

AttrNode.prototype.init = function init(attrName, simpleAttrValue) {
  this.isView = true;

  this.tagName = '';
  this.isVirtual = true;

  this.attrName = attrName;
  this.attrValue = simpleAttrValue;
  this.isDirty = true;
  this.isDestroying = false;
  this.lastValue = null;

  subscribe(this.attrValue, this.rerenderIfDirty, this);
};

AttrNode.prototype.renderIfDirty = function renderIfDirty() {
  if (this.isDirty && !this.isDestroying) {
    var value = read(this.attrValue);
    if (value !== this.lastValue) {
      this._renderer.renderTree(this, this._parentView);
    } else {
      this.isDirty = false;
    }
  }
};

AttrNode.prototype.render = function render(buffer) {
  this.isDirty = false;
  if (this.isDestroying) {
    return;
  }
  var value = read(this.attrValue);

  if (this.attrName === 'value' && (value === null || value === undefined)) {
    value = '';
  }

  if (this.lastValue !== null || value !== null) {
    this._morph.setContent(value);
    this.lastValue = value;
  }
};

AttrNode.prototype.rerender = function rerender() {
  this.isDirty = true;
  run.schedule('render', this, this.renderIfDirty);
};

AttrNode.prototype.rerenderIfDirty = function rerenderIfDirty() {
  run.schedule('render', this, this.renderIfDirty);
};

AttrNode.prototype.destroy = function destroy() {
  this.isDestroying = true;
  this.isDirty = false;

  unsubscribe(this.attrValue, this.rerenderIfDirty, this);

  if (!this.removedFromDOM && this._renderer) {
    this._renderer.remove(this, true);
  }
};

export default AttrNode;
