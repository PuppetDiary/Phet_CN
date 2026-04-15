// Copyright 2026, University of Colorado Boulder

/**
 * AccessibleListNode is a lightweight Node wrapper around AccessibleList so callers can add
 * list-based PDOM content to the scene graph like any other Node.
 *
 * This compatibility wrapper keeps list-related options in one place and maps the generated
 * template to Node's accessibleTemplate API.
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import type { AccessibleListItem, AccessibleListOptions } from './AccessibleList.js';
import AccessibleList from './AccessibleList.js';
import sceneryPhet from '../sceneryPhet.js';

type SelfOptions = Omit<AccessibleListOptions, 'listItems'>;
export type AccessibleListNodeOptions = SelfOptions &
  StrictOmit<NodeOptions, 'accessibleTemplate' | 'tagName'>;

export default class AccessibleListNode extends Node {

  public constructor(
    listItems: ( TReadOnlyProperty<string> | AccessibleListItem )[],
    providedOptions?: AccessibleListNodeOptions
  ) {

    const options = optionize<AccessibleListNodeOptions, EmptySelfOptions, SelfOptions & NodeOptions>()( {
      visibleProperty: null,
      leadingParagraphStringProperty: null,
      leadingParagraphVisibleProperty: null,
      listType: 'unordered',
      punctuationStyle: null,
      pickable: false
    }, providedOptions );

    const {
      visibleProperty,
      leadingParagraphStringProperty,
      leadingParagraphVisibleProperty,
      listType,
      punctuationStyle,
      ...nodeOptions
    } = options;

    const accessibleTemplate = AccessibleList.createTemplateProperty( {
      listItems: listItems,
      visibleProperty: visibleProperty,
      leadingParagraphStringProperty: leadingParagraphStringProperty,
      leadingParagraphVisibleProperty: leadingParagraphVisibleProperty,
      listType: listType,
      punctuationStyle: punctuationStyle
    } );

    super( {
      ...nodeOptions,
      tagName: 'div',
      visibleProperty: visibleProperty,
      accessibleTemplate: accessibleTemplate
    } );

    this.addDisposable( accessibleTemplate );
  }
}

sceneryPhet.register( 'AccessibleListNode', AccessibleListNode );
