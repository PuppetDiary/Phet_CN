// Copyright 2016-2025, University of Colorado Boulder

/**
 * ContinuumBarNode appears next to the radio buttons for choosing a hydrogen atom model, and indicates where
 * those models fall on the 'Classical' to 'Quantum' continuum.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import localeProperty from '../../../../joist/js/i18n/localeProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import modelsOfTheHydrogenAtom from '../../modelsOfTheHydrogenAtom.js';
import ModelsOfTheHydrogenAtomStrings from '../../ModelsOfTheHydrogenAtomStrings.js';
import MOTHAColors from '../MOTHAColors.js';
import MOTHAConstants from '../MOTHAConstants.js';

const X_MARGIN = 5;
const Y_MARGIN = 6;
const FONT = new PhetFont( 14 );

const isStackedChineseLocale = ( locale: string ): boolean => locale.startsWith( 'zh' );
const toStackedText = ( text: string ): string => text.split( '' ).join( '\n' );

export default class ContinuumBarNode extends Node {

  public constructor( barHeight: number, tandem: Tandem ) {

    // labels
    const classicalStringProperty = new DerivedProperty(
      [ localeProperty, ModelsOfTheHydrogenAtomStrings.classicalStringProperty ],
      ( locale, string ) => isStackedChineseLocale( locale ) ? toStackedText( string ) : string
    );
    const quantumStringProperty = new DerivedProperty(
      [ localeProperty, ModelsOfTheHydrogenAtomStrings.quantumStringProperty ],
      ( locale, string ) => isStackedChineseLocale( locale ) ? toStackedText( string ) : string
    );
    const textOptions = {
      font: FONT,
      fill: MOTHAColors.continuumBarTextFillProperty,
      rotation: Math.PI / 2,
      maxWidth: 0.4 * barHeight
    };
    const classicalText = new Text( classicalStringProperty, textOptions );
    const quantumText = new Text( quantumStringProperty, textOptions );
    localeProperty.link( locale => {
      classicalText.rotation = isStackedChineseLocale( locale ) ? 0 : Math.PI / 2;
      quantumText.rotation = isStackedChineseLocale( locale ) ? 0 : Math.PI / 2;
    } );

    const barWidth = Math.max( classicalText.width, quantumText.width ) + ( 2 * X_MARGIN );
    const barNode = new Rectangle( 0, 0, barWidth, barHeight, {
      cornerRadius: MOTHAConstants.CORNER_RADIUS,
      fill: MOTHAColors.continuumBarFillProperty,
      stroke: MOTHAColors.continuumBarStrokeProperty
    } );

    // 'Classical' at top
    const classicalTextCenterTop = barNode.centerTop.plusXY( 0, Y_MARGIN );
    classicalText.localBoundsProperty.link( () => {
      classicalText.centerTop = classicalTextCenterTop;
    } );

    // 'Quantum' at bottom
    const quantumTextCenterBottom = barNode.centerBottom.plusXY( 0, -Y_MARGIN );
    quantumText.localBoundsProperty.link( () => {
      quantumText.centerBottom = quantumTextCenterBottom;
    } );

    super( {
      isDisposable: false,
      children: [ barNode, classicalText, quantumText ],
      tandem: tandem,
      phetioDocumentation: 'The vertical bar that indicates where atomic models fall on the Classical to Quantum continuum.',
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
  }
}

modelsOfTheHydrogenAtom.register( 'ContinuumBarNode', ContinuumBarNode );
