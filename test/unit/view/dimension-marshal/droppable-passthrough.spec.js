// @flow
import createDimensionMarshal from '../../../../src/state/dimension-marshal/dimension-marshal';
import { getPreset } from '../../../utils/dimension';
import type {
  Callbacks,
  DimensionMarshal,
  StartPublishingResult,
} from '../../../../src/state/dimension-marshal/dimension-marshal-types';
import getViewport from '../../../../src/view/window/get-viewport';
import type {
  Critical,
  LiftRequest,
  DimensionMap,
  DraggableId,
  DroppableId,
  DraggableDimension,
  DroppableDimension,
  DraggableDimensionMap,
  DroppableDimensionMap,
} from '../../../../src/types';
import {
  populateMarshal,
  resetWatcher,
  getCallbacksStub,
  type DimensionWatcher,
} from './util';

const preset = getPreset();

const critical: Critical = {
  draggable: preset.inHome1.descriptor,
  droppable: preset.home.descriptor,
};

const criticalDimensions: DimensionMap = {
  draggables: {
    [preset.inHome1.descriptor.id]: preset.inHome1,
  },
  droppables: {
    [preset.home.descriptor.id]: preset.home,
  },
};

const defaultRequest: LiftRequest = {
  draggableId: critical.draggable.id,
  scrollOptions: {
    shouldPublishImmediately: false,
  },
};

describe('force scrolling a droppable', () => {
  it('should scroll the droppable', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    const watcher: DimensionWatcher = populateMarshal(marshal);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();
    expect(watcher.droppable.scroll).not.toHaveBeenCalled();

    // scroll
    marshal.scrollDroppable(critical.droppable.id, { x: 10, y: 20 });
    expect(watcher.droppable.scroll)
      .toHaveBeenCalledWith(critical.droppable.id, { x: 10, y: 20 });
  });

  it('should throw if the droppable cannot be found', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal, criticalDimensions);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();

    // scroll
    expect(() => {
      marshal.scrollDroppable(preset.foreign.descriptor.id, { x: 10, y: 20 });
    }).toThrow(`Cannot scroll Droppable ${preset.foreign.descriptor.id} as it is not registered`);
  });

  it('should not scroll the droppable if no collection is occurring', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    const watcher: DimensionWatcher = populateMarshal(marshal);

    marshal.scrollDroppable(critical.droppable.id, { x: 10, y: 20 });
    expect(watcher.droppable.scroll).not.toHaveBeenCalled();
  });
});

describe('responding to scroll changes', () => {
  it('should let consumers know', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    const watcher: DimensionWatcher = populateMarshal(marshal);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();
    expect(watcher.droppable.scroll).not.toHaveBeenCalled();

    marshal.updateDroppableScroll(critical.droppable.id, { x: 10, y: 20 });
    expect(callbacks.updateDroppableScroll).toHaveBeenCalledWith(
      critical.droppable.id, { x: 10, y: 20 }
    );
  });

  it('should throw if the droppable cannot be found', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal, criticalDimensions);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();
    expect(callbacks.updateDroppableScroll).not.toHaveBeenCalled();

    expect(() => {
      marshal.updateDroppableScroll(preset.foreign.descriptor.id, { x: 10, y: 20 });
    }).toThrow(`Cannot update the scroll on Droppable ${preset.foreign.descriptor.id} as it is not registered`);
  });

  it('should not let consumers know if know drag is occurring', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal, criticalDimensions);

    marshal.updateDroppableScroll(critical.droppable.id, { x: 10, y: 20 });
    expect(callbacks.updateDroppableScroll).not.toHaveBeenCalled();
  });
});

describe('is enabled changes', () => {
  it('should let consumers know', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();
    expect(callbacks.updateDroppableIsEnabled).not.toHaveBeenCalled();

    marshal.updateDroppableIsEnabled(critical.droppable.id, false);
    expect(callbacks.updateDroppableIsEnabled)
      .toHaveBeenCalledWith(critical.droppable.id, false);
  });

  it('should throw if the droppable cannot be found', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal, criticalDimensions);

    // initial lift
    marshal.startPublishing(defaultRequest, preset.windowScroll);
    marshal.collect({ includeCritical: false });
    requestAnimationFrame.flush();
    expect(callbacks.updateDroppableIsEnabled).not.toHaveBeenCalled();

    expect(() => marshal.updateDroppableIsEnabled(preset.foreign.descriptor.id, false))
      .toThrow(`Cannot update the scroll on Droppable ${preset.foreign.descriptor.id} as it is not registered`);
  });

  it('should not let consumers know if no collection is occurring', () => {
    const callbacks: Callbacks = getCallbacksStub();
    const marshal: DimensionMarshal = createDimensionMarshal(callbacks);
    populateMarshal(marshal, criticalDimensions);

    marshal.updateDroppableIsEnabled(critical.droppable.id, false);
    expect(callbacks.updateDroppableIsEnabled).not.toHaveBeenCalled();
  });
});
