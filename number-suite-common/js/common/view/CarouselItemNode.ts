// Copyright 2023-2025, University of Colorado Boulder

/**
 * Class for named items of a Carousel. Text is wrapped in a Rectangle for highlighting and input listeners.
 *
 * TODO: Consider moving to joist and generalizing further, see https://github.com/phetsims/joist/issues/908.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import PreferencesDialogConstants from '../../../../joist/js/preferences/PreferencesDialogConstants.js';
import PhetColorScheme from '../../../../scenery-phet/js/PhetColorScheme.js';
import FireListener from '../../../../scenery/js/listeners/FireListener.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HighlightOverlay from '../../../../scenery/js/overlays/HighlightOverlay.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import numberSuiteCommon from '../../numberSuiteCommon.js';
import NumberSuiteCommonStrings from '../../NumberSuiteCommonStrings.js';

const WIDTH = 200;
const PADDING = 5;

export default class CarouselItemNode<T> extends Rectangle {

  private readonly disposeSelectionNode: () => void;

  public constructor( property: TProperty<T | null>,
                      value: T,
                      name: string,
                      devName: string,
                      callback: () => void
  ) {

    // Include the locale code when running with ?dev.
    const string = phet.chipper.queryParameters.dev ? `${name} (${devName})` : name;

    const text = new Text( string, {
      font: PreferencesDialogConstants.CONTENT_FONT,
      maxWidth: WIDTH - PADDING * 2
    } );

    super( {
      rectWidth: WIDTH,
      rectHeight: text.bounds.height + PADDING * 2,
      cursor: 'pointer',

      // So that the item is tab-navigable and can be activated with the FireListener
      tagName: 'button',
      accessibleName: string
    } );
    text.center = this.center;
    this.addChild( text );

    const fireListener = new FireListener( {
      fire: () => {
        callback();
      },

      // Preferences components are not instrumented, see https://github.com/phetsims/joist/issues/744
      tandem: Tandem.OPT_OUT
    } );
    this.addInputListener( fireListener );

    // Will be unlinked with FireListener disposal
    fireListener.isOverProperty.link( isOver => {

      // makes the mouse interactive, keep the same dimensions so the layout will not change
      this.stroke = isOver ? HighlightOverlay.getInnerGroupHighlightColor() : Color.TRANSPARENT;
    } );

    const selectedAccessibleNameProperty = new PatternStringProperty(
      NumberSuiteCommonStrings.a11y.carouselItemNode.accessibleNameSelectedStringProperty, {
        value: string
      } );

    const listener = ( selection: T | null ) => {

      // identifies the selected locale
      this.fill = selection === value ? PhetColorScheme.PHET_LOGO_BLUE : null;
      this.accessibleName = selection === value ? selectedAccessibleNameProperty : string;
    };
    property.link( listener );

    this.disposeSelectionNode = () => {
      text.dispose();
      property.unlink( listener );
      this.removeInputListener( fireListener );
      fireListener.dispose();
      selectedAccessibleNameProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSelectionNode();
    super.dispose();
  }
}

numberSuiteCommon.register( 'CarouselItemNode', CarouselItemNode );